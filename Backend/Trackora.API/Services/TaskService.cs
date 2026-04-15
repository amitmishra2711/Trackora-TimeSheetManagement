using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;
using System.Threading.Tasks;
using TaskItem = Trackora.API.Models.TaskItem;

namespace Trackora.API.Services
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _db;
        public TaskService(AppDbContext db) => _db = db;

        private IQueryable<TaskItem> Base() => _db.Tasks
            .Include(t => t.Project)
            .Include(t => t.AssignedToUser)
            .Include(t => t.AssignedByUser)
            .Where(t => !t.IsDeleted);

        public async Task<PagedResult<TaskDto>> GetAllAsync(PaginationQuery query, int? projectId)
        {
            var q = Base();

            if (projectId.HasValue)
                q = q.Where(t => t.ProjectId == projectId);

            if (!string.IsNullOrEmpty(query.Search))
                q = q.Where(t => t.Title.Contains(query.Search));

            var total = await q.CountAsync();

            var items = (await q.OrderByDescending(t => t.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync())
                .Select(t => Map(t)).ToList();

            return new PagedResult<TaskDto>
            {
                Items = items,
                TotalCount = total,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        public async Task<TaskDto> GetByIdAsync(int id) =>
            Map(await Base().FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new KeyNotFoundException("Task not found."));

        public async Task<TaskDto> CreateAsync(CreateTaskDto dto, int assignedBy)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                ProjectId = dto.ProjectId,
                AssignedTo = dto.AssignedTo,
                AssignedBy = assignedBy,
                Priority = dto.Priority,
                DueDate = dto.DueDate
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            return await GetByIdAsync(task.Id);
        }

        public async Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto)
        {
            var task = await _db.Tasks.FindAsync(id)
                ?? throw new KeyNotFoundException("Task not found.");

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Priority = dto.Priority;
            task.Status = dto.Status;
            task.DueDate = dto.DueDate;

            await _db.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task DeleteAsync(int id)
        {
            var task = await _db.Tasks.FindAsync(id)
                ?? throw new KeyNotFoundException("Task not found.");

            task.IsDeleted = true;
            await _db.SaveChangesAsync();
        }

        public async Task<TaskDto> UpdateStatusAsync(int id, string status)
        {
            var task = await _db.Tasks.FindAsync(id)
                ?? throw new KeyNotFoundException("Task not found.");

            task.Status = status;
            await _db.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<List<TaskDto>> GetTasksByUserAsync(int userId) =>
            (await Base().Where(t => t.AssignedTo == userId).ToListAsync())
            .Select(t => Map(t)).ToList();

        public async Task<List<TaskDto>> GetTasksByProjectAsync(int projectId) =>
            (await Base().Where(t => t.ProjectId == projectId).ToListAsync())
            .Select(t => Map(t)).ToList();

        private static TaskDto Map(TaskItem t) => new()
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            ProjectId = t.ProjectId,
            ProjectName = t.Project.Name,
            AssignedTo = t.AssignedTo,
            AssignedToName = $"{t.AssignedToUser.FirstName} {t.AssignedToUser.LastName}",
            AssignedBy = t.AssignedBy,
            AssignedByName = $"{t.AssignedByUser.FirstName} {t.AssignedByUser.LastName}",
            Priority = t.Priority,
            Status = t.Status,
            DueDate = t.DueDate,
            CreatedAt = t.CreatedAt
        };

      public async Task<PagedResult<TaskDto>> GetAllAsync(PaginationQuery query, int? projectId, int? leaderId = null)
        {
            var q = Base();
            if (projectId.HasValue) q = q.Where(t => t.ProjectId == projectId);
            if (!string.IsNullOrEmpty(query.Search))
                q = q.Where(t =>
                    t.Title.Contains(query.Search) ||
                    t.Project.Name.Contains(query.Search));
 
            if (leaderId.HasValue)
            {
                var teamMemberIds = await _db.Teams
                    .Where(t => t.LeaderId == leaderId.Value && !t.IsDeleted)
                    .SelectMany(t => t.TeamMembers.Select(tm => tm.UserId))
                    .ToListAsync();
 
                q = q.Where(t => teamMemberIds.Contains(t.AssignedTo));
            }
 
            var total = await q.CountAsync(); 
            var items = (await q.OrderByDescending(t => t.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync())
                .Select(Map).ToList();
            return new PagedResult<TaskDto> { Items = items, TotalCount = total, Page = query.Page, PageSize = query.PageSize };
        }
 

  public async Task<bool> IsUserInProjectAsync(int userId, int projectId) =>
            await _db.ProjectTeams.AnyAsync(pt =>
                pt.ProjectId == projectId &&
                pt.Team.TeamMembers.Any(tm => tm.UserId == userId));
       }
}
