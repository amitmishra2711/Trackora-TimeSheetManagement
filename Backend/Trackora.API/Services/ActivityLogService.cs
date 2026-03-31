using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Models;
using Trackora.API.Services.Interfaces;


namespace Trackora.API.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly AppDbContext _db;
        public ActivityLogService(AppDbContext db) => _db = db;

        public async Task<PagedResult<ActivityLogDto>> GetAllAsync(PaginationQuery query)
        {
            var q = _db.ActivityLogs.Include(a => a.User).AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
                q = q.Where(a => a.Action.Contains(query.Search));

            var total = await q.CountAsync();

            var items = await q.OrderByDescending(a => a.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(a => new ActivityLogDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserName = $"{a.User.FirstName} {a.User.LastName}",
                    Action = a.Action,
                    Details = a.Details,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return new PagedResult<ActivityLogDto>
            {
                Items = items,
                TotalCount = total,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        public async Task LogAsync(int userId, string action, string? details = null)
        {
            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                Action = action,
                Details = details
            });

            await _db.SaveChangesAsync();
        }
    }
}