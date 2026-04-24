using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Services
{
     public class TimesheetAnalyticsService : ITimesheetAnalyticsService
    {
        private readonly AppDbContext _db;
        public TimesheetAnalyticsService(AppDbContext db) => _db = db;
 
        private async Task<List<Models.Timesheet>> FetchAsync(
            TimesheetFilterDto filter, int? leaderId = null)
        {
            var q = _db.Timesheets
                .Include(ts => ts.User)
                .Include(ts => ts.Project)
                    .ThenInclude(p => p.ProjectTeams)
                        .ThenInclude(pt => pt.Team)
                            .ThenInclude(t => t.TeamMembers)
                .Include(ts => ts.Task)
                .Where(ts => !ts.IsDeleted);
 
            // Leader scope — only their teams' members
            if (leaderId.HasValue)
            {
                var leaderMemberIds = await _db.Teams
                    .Where(t => t.LeaderId == leaderId.Value && !t.IsDeleted)
                    .SelectMany(t => t.TeamMembers.Select(tm => tm.UserId))
                    .Distinct()
                    .ToListAsync();
                q = q.Where(ts => leaderMemberIds.Contains(ts.UserId));
            }
 
            // Apply filters (all optional, combined with AND)
            if (filter.EmployeeId.HasValue)
                q = q.Where(ts => ts.UserId == filter.EmployeeId.Value);
 
            if (filter.ProjectId.HasValue)
                q = q.Where(ts => ts.ProjectId == filter.ProjectId.Value);
 
            if (filter.TeamId.HasValue)
                q = q.Where(ts => ts.Project.ProjectTeams
                    .Any(pt => pt.TeamId == filter.TeamId.Value &&
                               pt.Team.TeamMembers.Any(tm => tm.UserId == ts.UserId)));
 
            if (filter.StartDate.HasValue)
                q = q.Where(ts => ts.Date >= filter.StartDate.Value.Date);
 
            if (filter.EndDate.HasValue)
                q = q.Where(ts => ts.Date <= filter.EndDate.Value.Date);
 
            return await q.OrderBy(ts => ts.ProjectId)
                          .ThenBy(ts => ts.UserId)
                          .ThenBy(ts => ts.Date)
                          .ToListAsync();
        }
 
        // ─── Weekly summary calculation ───────────────────────
        private static WeeklySummaryDto BuildSummary(
            List<Models.Timesheet> data, TimesheetFilterDto filter)
        {
            // Use filter dates if provided, else current month
            var now = DateTime.UtcNow;
            var monthStart = filter.StartDate ?? new DateTime(now.Year, now.Month, 1);
            var monthEnd   = filter.EndDate   ?? new DateTime(now.Year, now.Month,
                DateTime.DaysInMonth(now.Year, now.Month));
 
            // Split month into 4 weekly buckets
            // Week 1: day 1–7, Week 2: 8–14, Week 3: 15–21, Week 4: 22–end
            decimal W(int dayFrom, int dayTo) => data
                .Where(ts => ts.Date.Month == monthStart.Month &&
                             ts.Date.Year  == monthStart.Year  &&
                             ts.Date.Day   >= dayFrom          &&
                             ts.Date.Day   <= dayTo)
                .Sum(ts => ts.HoursWorked);
 
            return new WeeklySummaryDto
            {
                ThisMonth = data.Where(ts => ts.Date >= monthStart && ts.Date <= monthEnd)
                                .Sum(ts => ts.HoursWorked),
                Week1 = W(1, 7),
                Week2 = W(8, 14),
                Week3 = W(15, 21),
                Week4 = W(22, 31),
            };
        }
 
        // ─── Hierarchical grouping: Project → Team → Employee ─
        private async Task<List<ProjectTimesheetGroupDto>> BuildGrouped(
            List<Models.Timesheet> data, int? leaderId)
        {
            // Build team lookup: teamId → teamName  (via TeamMembers + ProjectTeams)
            var allTeams = await _db.Teams
                .Include(t => t.TeamMembers)
                .Where(t => !t.IsDeleted)
                .ToListAsync();
 
            // For a given userId + projectId, find which team they belong to
            // that is also assigned to that project
            var projectTeams = await _db.ProjectTeams
                .Include(pt => pt.Team)
                    .ThenInclude(t => t.TeamMembers)
                .ToListAsync();
 
            Models.Team? ResolveTeam(int userId, int projectId)
            {
                return projectTeams
                    .Where(pt => pt.ProjectId == projectId)
                    .FirstOrDefault(pt => pt.Team.TeamMembers.Any(tm => tm.UserId == userId))
                    ?.Team;
            }
 
            // Group by project
            var byProject = data.GroupBy(ts => new { ts.ProjectId, ts.Project.Name });
 
            var result = new List<ProjectTimesheetGroupDto>();
 
            foreach (var proj in byProject)
            {
                var projectGroup = new ProjectTimesheetGroupDto
                {
                    ProjectId   = proj.Key.ProjectId,
                    ProjectName = proj.Key.Name,
                };
 
                // Group by team within this project
                var byTeam = proj
                    .GroupBy(ts => ResolveTeam(ts.UserId, ts.ProjectId))
                    .OrderBy(g => g.Key?.Name ?? "Unassigned");
 
                foreach (var teamGrp in byTeam)
                {
                    var team = teamGrp.Key;
 
                    // Filter by leaderId if needed
                    if (leaderId.HasValue && team != null && team.LeaderId != leaderId.Value)
                        continue;
 
                    var teamGroup = new TeamTimesheetGroupDto
                    {
                        TeamId   = team?.Id ?? 0,
                        TeamName = team?.Name ?? "Unassigned",
                    };
 
                    var byEmployee = teamGrp.GroupBy(ts => new { ts.UserId, ts.User.FirstName });
 
                    foreach (var empGrp in byEmployee)
                    {
                        var empGroup = new EmployeeTimesheetGroupDto
                        {
                            UserId   = empGrp.Key.UserId,
                            UserName = empGrp.Key.FirstName,
                            TotalHours = empGrp.Sum(ts => ts.HoursWorked),
                            Entries = empGrp.Select(ts => new EmployeeTimesheetRowDto
                            {
                                TimesheetId = ts.Id,
                                UserId      = ts.UserId,
                                UserName    = $"{ts.User.FirstName} {ts.User.LastName}",
                                DayOfWeek   = ts.Date.DayOfWeek.ToString(),
                                Date        = ts.Date,
                                HoursWorked = ts.HoursWorked,
                                TaskTitle   = ts.Task.Title,
                                Description = ts.Description ?? string.Empty,
                                Status      = ts.Status,
                            })
                            .OrderBy(e => e.Date)
                            .ToList()
                        };
                        teamGroup.Employees.Add(empGroup);
                        teamGroup.TotalHours += empGroup.TotalHours;
                    }
 
                    projectGroup.Teams.Add(teamGroup);
                    projectGroup.TotalHours += teamGroup.TotalHours;
                }
 
                result.Add(projectGroup);
            }
 
            return result.OrderBy(p => p.ProjectName).ToList();
        }
 
        // ─── PUBLIC: GetAnalyticsAsync ─────────────────────────
        public async Task<TimesheetAnalyticsDto> GetAnalyticsAsync(
            TimesheetFilterDto filter, int? leaderId = null)
        {
            var data = await FetchAsync(filter, leaderId);
            return new TimesheetAnalyticsDto
            {
                Summary      = BuildSummary(data, filter),
                Grouped      = await BuildGrouped(data, leaderId),
                TotalRecords = data.Count,
            };
        }
 
        // ─── PUBLIC: ExportToExcelAsync ────────────────────────
        public async Task<byte[]> ExportToExcelAsync(
            TimesheetFilterDto filter, int? leaderId = null)
        {
            var data    = await FetchAsync(filter, leaderId);
            var grouped = await BuildGrouped(data, leaderId);
            var summary = BuildSummary(data, filter);
 
            using var wb = new XLWorkbook();
 
            // ── Sheet 1: Summary ──────────────────────────────
            var wsSummary = wb.Worksheets.Add("Summary");
            wsSummary.Cell(1, 1).Value = "Trackora – Timesheet Report";
            wsSummary.Cell(1, 1).Style.Font.Bold    = true;
            wsSummary.Cell(1, 1).Style.Font.FontSize = 14;
            wsSummary.Cell(2, 1).Value = $"Generated: {DateTime.Now:dd MMM yyyy HH:mm}";
            wsSummary.Cell(4, 1).Value = "Period";       wsSummary.Cell(4, 2).Value = "Hours";
            wsSummary.Row(4).Style.Font.Bold = true;
            wsSummary.Cell(5, 1).Value = "This Month";  wsSummary.Cell(5, 2).Value = (double)summary.ThisMonth;
            wsSummary.Cell(6, 1).Value = "Week 1 (1–7)";  wsSummary.Cell(6, 2).Value = (double)summary.Week1;
            wsSummary.Cell(7, 1).Value = "Week 2 (8–14)"; wsSummary.Cell(7, 2).Value = (double)summary.Week2;
            wsSummary.Cell(8, 1).Value = "Week 3 (15–21)";wsSummary.Cell(8, 2).Value = (double)summary.Week3;
            wsSummary.Cell(9, 1).Value = "Week 4 (22+)";  wsSummary.Cell(9, 2).Value = (double)summary.Week4;
            wsSummary.Columns().AdjustToContents();
 
            // ── Sheet 2: Project-wise ─────────────────────────
            var wsProj = wb.Worksheets.Add("By Project");
            WriteHeader(wsProj, new[] { "Project", "Team", "Employee", "Day", "Date", "Hours", "Task", "Description", "Status" });
            int row = 2;
            foreach (var proj in grouped)
            {
                foreach (var team in proj.Teams)
                    foreach (var emp in team.Employees)
                        foreach (var e in emp.Entries)
                        {
                            wsProj.Cell(row, 1).Value = proj.ProjectName;
                            wsProj.Cell(row, 2).Value = team.TeamName;
                            wsProj.Cell(row, 3).Value = emp.UserName;
                            wsProj.Cell(row, 4).Value = e.DayOfWeek;
                            wsProj.Cell(row, 5).Value = e.Date.ToString("dd-MMM-yyyy");
                            wsProj.Cell(row, 6).Value = (double)e.HoursWorked;
                            wsProj.Cell(row, 7).Value = e.TaskTitle;
                            wsProj.Cell(row, 8).Value = e.Description;
                            wsProj.Cell(row, 9).Value = e.Status;
                            row++;
                        }
                // Project total row
                wsProj.Cell(row, 1).Value = $"Project Total: {proj.ProjectName}";
                wsProj.Cell(row, 6).Value = (double)proj.TotalHours;
                wsProj.Row(row).Style.Font.Bold = true;
                wsProj.Row(row).Style.Fill.BackgroundColor = XLColor.LightBlue;
                row += 2;
            }
            wsProj.Columns().AdjustToContents();
 
            // ── Sheet 3: Team-wise ────────────────────────────
            var wsTeam = wb.Worksheets.Add("By Team");
            WriteHeader(wsTeam, new[] { "Team", "Employee", "Project", "Day", "Date", "Hours", "Task", "Status" });
            row = 2;
            var byTeamFlat = grouped
                .SelectMany(p => p.Teams.Select(t => new { proj = p, team = t }))
                .GroupBy(x => new { x.team.TeamId, x.team.TeamName });
            foreach (var tg in byTeamFlat)
            {
                foreach (var x in tg)
                    foreach (var emp in x.team.Employees)
                        foreach (var e in emp.Entries)
                        {
                            wsTeam.Cell(row, 1).Value = tg.Key.TeamName;
                            wsTeam.Cell(row, 2).Value = emp.UserName;
                            wsTeam.Cell(row, 3).Value = x.proj.ProjectName;
                            wsTeam.Cell(row, 4).Value = e.DayOfWeek;
                            wsTeam.Cell(row, 5).Value = e.Date.ToString("dd-MMM-yyyy");
                            wsTeam.Cell(row, 6).Value = (double)e.HoursWorked;
                            wsTeam.Cell(row, 7).Value = e.TaskTitle;
                            wsTeam.Cell(row, 8).Value = e.Status;
                            row++;
                        }
                var teamTotal = tg.Sum(x => x.team.TotalHours);
                wsTeam.Cell(row, 1).Value = $"Team Total: {tg.Key.TeamName}";
                wsTeam.Cell(row, 6).Value = (double)teamTotal;
                wsTeam.Row(row).Style.Font.Bold = true;
                wsTeam.Row(row).Style.Fill.BackgroundColor = XLColor.LightGreen;
                row += 2;
            }
            wsTeam.Columns().AdjustToContents();
 
            // ── Sheet 4: Employee-wise ────────────────────────
            var wsEmp = wb.Worksheets.Add("By Employee");
            WriteHeader(wsEmp, new[] { "Employee", "Project", "Team", "Day", "Date", "Hours", "Task", "Status" });
            row = 2;
            var byEmpFlat = grouped
                .SelectMany(p => p.Teams
                    .SelectMany(t => t.Employees
                        .Select(e => new { proj = p, team = t, emp = e })))
                .GroupBy(x => new { x.emp.UserId, x.emp.UserName });
            foreach (var eg in byEmpFlat)
            {
                foreach (var x in eg)
                    foreach (var e in x.emp.Entries)
                    {
                        wsEmp.Cell(row, 1).Value = eg.Key.UserName;
                        wsEmp.Cell(row, 2).Value = x.proj.ProjectName;
                        wsEmp.Cell(row, 3).Value = x.team.TeamName;
                        wsEmp.Cell(row, 4).Value = e.DayOfWeek;
                        wsEmp.Cell(row, 5).Value = e.Date.ToString("dd-MMM-yyyy");
                        wsEmp.Cell(row, 6).Value = (double)e.HoursWorked;
                        wsEmp.Cell(row, 7).Value = e.TaskTitle;
                        wsEmp.Cell(row, 8).Value = e.Status;
                        row++;
                    }
                var empTotal = eg.Sum(x => x.emp.TotalHours);
                wsEmp.Cell(row, 1).Value = $"Employee Total: {eg.Key.UserName}";
                wsEmp.Cell(row, 6).Value = (double)empTotal;
                wsEmp.Row(row).Style.Font.Bold = true;
                wsEmp.Row(row).Style.Fill.BackgroundColor = XLColor.LightYellow;
                row += 2;
            }
            wsEmp.Columns().AdjustToContents();
 
            using var ms = new MemoryStream();
            wb.SaveAs(ms);
            return ms.ToArray();
        }
 
        private static void WriteHeader(IXLWorksheet ws, string[] cols)
        {
            for (int i = 0; i < cols.Length; i++)
            {
                ws.Cell(1, i + 1).Value = cols[i];
                ws.Cell(1, i + 1).Style.Font.Bold = true;
                ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#4F46E5");
                ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
            }
        }
    }
}
 

