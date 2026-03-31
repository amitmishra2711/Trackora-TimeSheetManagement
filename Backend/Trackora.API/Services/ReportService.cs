using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Models;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _db;
        public ReportService(AppDbContext db) => _db = db;

        public async Task<List<DailyReportDto>> GetAllAsync(int? teamId)
        {
            var q = _db.DailyReports.Include(r => r.Team).Include(r => r.Leader)
                .Include(r => r.ReportDetails).ThenInclude(d => d.Task).AsQueryable();

            if (teamId.HasValue) q = q.Where(r => r.TeamId == teamId);

            return (await q.OrderByDescending(r => r.ReportDate).ToListAsync())
                .Select(Map).ToList();
        }

        public async Task<DailyReportDto> GetByIdAsync(int id)
        {
            var r = await _db.DailyReports.Include(r => r.Team).Include(r => r.Leader)
                .Include(r => r.ReportDetails).ThenInclude(d => d.Task)
                .FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new KeyNotFoundException("Report not found.");

            return Map(r);
        }

        public async Task<DailyReportDto> CreateAsync(CreateDailyReportDto dto, int leaderId)
        {
            var report = new DailyReport
            {
                TeamId = dto.TeamId,
                LeaderId = leaderId,
                ReportDate = dto.ReportDate,
                Summary = dto.Summary
            };

            _db.DailyReports.Add(report);
            await _db.SaveChangesAsync();

            foreach (var d in dto.Details)
            {
                _db.ReportDetails.Add(new ReportDetail
                {
                    ReportId = report.Id,
                    TaskId = d.TaskId,
                    Notes = d.Notes
                });
            }

            await _db.SaveChangesAsync();
            return await GetByIdAsync(report.Id);
        }

        public async Task<byte[]> ExportTimesheetsExcelAsync(int? userId, int? projectId, DateTime? from, DateTime? to, int adminId)
        {
            var q = _db.Timesheets.Include(ts => ts.User).Include(ts => ts.Project).Include(ts => ts.Task)
                .Where(ts => !ts.IsDeleted);

            if (userId.HasValue) q = q.Where(ts => ts.UserId == userId);
            if (projectId.HasValue) q = q.Where(ts => ts.ProjectId == projectId);
            if (from.HasValue) q = q.Where(ts => ts.Date >= from);
            if (to.HasValue) q = q.Where(ts => ts.Date <= to);

            var data = await q.OrderByDescending(ts => ts.Date).ToListAsync();

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Timesheets");

            ws.Cell(1, 1).Value = "Employee";
            ws.Cell(1, 2).Value = "Project";
            ws.Cell(1, 3).Value = "Task";
            ws.Cell(1, 4).Value = "Date";
            ws.Cell(1, 5).Value = "Hours";
            ws.Cell(1, 6).Value = "Status";
            ws.Cell(1, 7).Value = "Description";

            ws.Row(1).Style.Font.Bold = true;

            for (int i = 0; i < data.Count; i++)
            {
                var ts = data[i];
                ws.Cell(i + 2, 1).Value = $"{ts.User.FirstName} {ts.User.LastName}";
                ws.Cell(i + 2, 2).Value = ts.Project.Name;
                ws.Cell(i + 2, 3).Value = ts.Task.Title;
                ws.Cell(i + 2, 4).Value = ts.Date.ToString("yyyy-MM-dd");
                ws.Cell(i + 2, 5).Value = (double)ts.HoursWorked;
                ws.Cell(i + 2, 6).Value = ts.Status;
                ws.Cell(i + 2, 7).Value = ts.Description ?? "";
            }

            ws.Columns().AdjustToContents();

            _db.ExportLogs.Add(new ExportLog
            {
                AdminId = adminId,
                ExportType = "Timesheets",
                FileType = "Excel"
            });

            await _db.SaveChangesAsync();

            using var ms = new MemoryStream();
            wb.SaveAs(ms);

            return ms.ToArray();
        }

        public async Task<byte[]> ExportTimesheetsPdfAsync(int? userId, int? projectId, DateTime? from, DateTime? to, int adminId)
        {
            var q = _db.Timesheets.Include(ts => ts.User).Include(ts => ts.Project).Include(ts => ts.Task)
                .Where(ts => !ts.IsDeleted);

            if (userId.HasValue) q = q.Where(ts => ts.UserId == userId);
            if (projectId.HasValue) q = q.Where(ts => ts.ProjectId == projectId);
            if (from.HasValue) q = q.Where(ts => ts.Date >= from);
            if (to.HasValue) q = q.Where(ts => ts.Date <= to);

            var data = await q.OrderByDescending(ts => ts.Date).ToListAsync();

            var rows = string.Join("", data.Select(ts => $@"
                <tr>
                    <td>{ts.User.FirstName} {ts.User.LastName}</td>
                    <td>{ts.Project.Name}</td>
                    <td>{ts.Task.Title}</td>
                    <td>{ts.Date:yyyy-MM-dd}</td>
                    <td>{ts.HoursWorked:F2}</td>
                    <td>{ts.Status}</td>
                </tr>"));

            var html = $@"
                <html><body>
                <h1>Trackora - Timesheet Report</h1>
                <table border='1'>
                    <tr><th>Employee</th><th>Project</th><th>Task</th><th>Date</th><th>Hours</th><th>Status</th></tr>
                    {rows}
                </table></body></html>";

            _db.ExportLogs.Add(new ExportLog
            {
                AdminId = adminId,
                ExportType = "Timesheets",
                FileType = "PDF"
            });

            await _db.SaveChangesAsync();

            return System.Text.Encoding.UTF8.GetBytes(html);
        }

        private static DailyReportDto Map(DailyReport r) => new()
        {
            Id = r.Id,
            TeamId = r.TeamId,
            TeamName = r.Team.Name,
            LeaderId = r.LeaderId,
            LeaderName = $"{r.Leader.FirstName} {r.Leader.LastName}",
            ReportDate = r.ReportDate,
            Summary = r.Summary,
            SubmittedAt = r.SubmittedAt,
            Details = r.ReportDetails.Select(d => new ReportDetailDto
            {
                Id = d.Id,
                TaskId = d.TaskId,
                TaskTitle = d.Task.Title,
                Notes = d.Notes
            }).ToList()
        };
    }
}