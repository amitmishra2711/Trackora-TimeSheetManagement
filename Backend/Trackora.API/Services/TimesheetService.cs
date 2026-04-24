using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Models;
using Trackora.API.Services.Interfaces;
namespace Trackora.API.Services
{
    public class TimesheetService : ITimesheetService
    {
        private readonly AppDbContext _db;
        public TimesheetService(AppDbContext db) { _db = db; }

        private IQueryable<Timesheet> Base() => _db.Timesheets
            .Include(ts => ts.User).Include(ts => ts.Project).Include(ts => ts.Task)
            .Where(ts => !ts.IsDeleted);

        public async Task<PagedResult<TimesheetDto>> GetAllAsync(PaginationQuery query, int? userId, int? projectId, string? sortBy = null, string? sortDir = null)
        {
            var q = Base();
            if (userId.HasValue) q = q.Where(ts => ts.UserId == userId);
            if (projectId.HasValue) q = q.Where(ts => ts.ProjectId == projectId);
            if (!string.IsNullOrEmpty(query.Search))
                q = q.Where(ts =>
                    (ts.User.FirstName + " " + ts.User.LastName).Contains(query.Search) ||
                    ts.Project.Name.Contains(query.Search) ||
                    ts.Task.Title.Contains(query.Search) ||
                    (ts.Description != null && ts.Description.Contains(query.Search)));

            // Sorting
            bool desc = sortDir?.ToLower() != "asc";
            q = sortBy?.ToLower() switch
            {
                "username" => desc ? q.OrderByDescending(ts => ts.User.FirstName) : q.OrderBy(ts => ts.User.FirstName),
                "project" => desc ? q.OrderByDescending(ts => ts.Project.Name) : q.OrderBy(ts => ts.Project.Name),
                "task" => desc ? q.OrderByDescending(ts => ts.Task.Title) : q.OrderBy(ts => ts.Task.Title),
                "hours" => desc ? q.OrderByDescending(ts => ts.HoursWorked) : q.OrderBy(ts => ts.HoursWorked),
                "status" => desc ? q.OrderByDescending(ts => ts.Status) : q.OrderBy(ts => ts.Status),
                _ => desc ? q.OrderByDescending(ts => ts.Date) : q.OrderBy(ts => ts.Date),
            };

            var total = await q.CountAsync();
            var items = (await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync())
                .Select(Map).ToList();
            return new PagedResult<TimesheetDto> { Items = items, TotalCount = total, Page = query.Page, PageSize = query.PageSize };
        }

        public async Task<TimesheetDto> GetByIdAsync(int id) =>
            Map(await Base().FirstOrDefaultAsync(ts => ts.Id == id) ?? throw new KeyNotFoundException("Timesheet not found."));

        public async Task<TimesheetDto> CreateAsync(CreateTimesheetDto dto, int userId)
        {
            var ts = new Timesheet
            {
                UserId = userId,
                ProjectId = dto.ProjectId,
                TaskId = dto.TaskId,
                Date = dto.Date,
                HoursWorked = dto.HoursWorked,
                Description = dto.Description
            };
            _db.Timesheets.Add(ts);
            await _db.SaveChangesAsync();
            return await GetByIdAsync(ts.Id);
        }

        public async Task<TimesheetDto> UpdateAsync(int id, UpdateTimesheetDto dto, int userId)
        {
            var ts = await _db.Timesheets.FindAsync(id) ?? throw new KeyNotFoundException("Timesheet not found.");
            if (ts.UserId != userId) throw new UnauthorizedAccessException("Not your timesheet.");
            if (ts.Status == "Approved") throw new InvalidOperationException("Cannot edit approved timesheet.");
            if ((DateTime.UtcNow - ts.CreatedAt).TotalDays > 7) throw new InvalidOperationException("Cannot edit timesheet older than 7 days.");
            ts.HoursWorked = dto.HoursWorked; ts.Description = dto.Description;
            ts.TaskId = dto.TaskId; ts.ProjectId = dto.ProjectId;
            await _db.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var ts = await _db.Timesheets.FindAsync(id) ?? throw new KeyNotFoundException("Timesheet not found.");
            if (ts.UserId != userId) throw new UnauthorizedAccessException("Not your timesheet.");
            if (ts.Status == "Approved") throw new InvalidOperationException("Cannot delete approved timesheet.");
            if ((DateTime.UtcNow - ts.CreatedAt).TotalDays > 7) throw new InvalidOperationException("Cannot delete timesheet older than 7 days.");
            ts.IsDeleted = true;
            await _db.SaveChangesAsync();
        }

        public async Task<TimesheetDto> ApproveAsync(int id, string status, int leaderId)
        {
            var ts = await _db.Timesheets.FindAsync(id) ?? throw new KeyNotFoundException("Timesheet not found.");
            ts.Status = status;
            await _db.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<List<TimesheetDto>> GetByTeamAsync(int teamId)
        {
            var memberIds = await _db.TeamMembers.Where(tm => tm.TeamId == teamId).Select(tm => tm.UserId).ToListAsync();
            return (await Base().Where(ts => memberIds.Contains(ts.UserId)).OrderByDescending(ts => ts.Date).ToListAsync())
                .Select(Map).ToList();
        }

        public async Task<List<TimesheetDto>> GetByLeaderTeamsAsync(int leaderId)
        {
            var memberIds = await _db.Teams
                .Where(t => t.LeaderId == leaderId && !t.IsDeleted)
                .SelectMany(t => t.TeamMembers.Select(tm => tm.UserId))
                .Distinct()
                .ToListAsync();
            return (await Base()
                .Where(ts => memberIds.Contains(ts.UserId))
                .OrderByDescending(ts => ts.Date)
                .ToListAsync())
                .Select(Map).ToList();
        }

        public async Task<List<TimesheetDto>> GetMyTimesheetsAsync(int userId) =>
            (await Base().Where(ts => ts.UserId == userId).OrderByDescending(ts => ts.Date).ToListAsync())
            .Select(Map).ToList();

        public async Task<List<TimesheetDto>> GetByMemberAndProjectAsync(int userId, int projectId) =>
            (await Base()
                .Where(ts => ts.UserId == userId && ts.ProjectId == projectId)
                .OrderByDescending(ts => ts.Date)
                .ToListAsync())
            .Select(Map).ToList();

        private static TimesheetDto Map(Timesheet ts) => new()
        {
            Id = ts.Id,
            UserId = ts.UserId,
            UserName = $"{ts.User.FirstName} {ts.User.LastName}",
            ProjectId = ts.ProjectId,
            ProjectName = ts.Project.Name,
            TaskId = ts.TaskId,
            TaskTitle = ts.Task.Title,
            Date = ts.Date,
            HoursWorked = ts.HoursWorked,
            Description = ts.Description,
            Status = ts.Status,
            CreatedAt = ts.CreatedAt,
            CanEdit = ts.Status != "Approved" && (DateTime.UtcNow - ts.CreatedAt).TotalDays <= 7
        };
    }
}