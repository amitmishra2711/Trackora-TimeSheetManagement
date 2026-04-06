using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Models;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _db;
        public ProjectService(AppDbContext db) => _db = db;

        public async Task<PagedResult<ProjectDto>> GetAllAsync(PaginationQuery query)
        {
            var q = _db.Projects.Include(p => p.Creator)
                .Include(p => p.ProjectTeams).ThenInclude(pt => pt.Team).ThenInclude(t => t.Leader)
                .Include(p => p.ProjectTeams).ThenInclude(pt => pt.Team).ThenInclude(t => t.TeamMembers).ThenInclude(tm => tm.User)
                .Where(p => !p.IsDeleted);

            if (!string.IsNullOrEmpty(query.Search))
                q = q.Where(p => p.Name.Contains(query.Search));

            var total = await q.CountAsync();

            var items = (await q.OrderByDescending(p => p.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync())
                .Select(Map).ToList();

            return new PagedResult<ProjectDto>
            {
                Items = items,
                TotalCount = total,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        public async Task<ProjectDto> GetByIdAsync(int id)
        {
            var p = await _db.Projects.Include(p => p.Creator)
                .Include(p => p.ProjectTeams).ThenInclude(pt => pt.Team).ThenInclude(t => t.Leader)
                .Include(p => p.ProjectTeams).ThenInclude(pt => pt.Team).ThenInclude(t => t.TeamMembers).ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted)
                ?? throw new KeyNotFoundException("Project not found.");

            return Map(p);
        }

        public async Task<ProjectDto> CreateAsync(CreateProjectDto dto, int adminId)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedBy = adminId
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            foreach (var tid in dto.TeamIds)
                _db.ProjectTeams.Add(new ProjectTeam { ProjectId = project.Id, TeamId = tid });

            await _db.SaveChangesAsync();

            return await GetByIdAsync(project.Id);
        }

        public async Task<ProjectDto> UpdateAsync(int id, UpdateProjectDto dto)
        {
            var p = await _db.Projects.FindAsync(id)
                ?? throw new KeyNotFoundException("Project not found.");

            p.Name = dto.Name;
            p.Description = dto.Description;
            p.Status = dto.Status;

            await _db.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task DeleteAsync(int id)
        {
            var p = await _db.Projects.FindAsync(id)
                ?? throw new KeyNotFoundException("Project not found.");

            p.IsDeleted = true;
            await _db.SaveChangesAsync();
        }

        public async Task AssignTeamAsync(int projectId, int teamId)
        {
            if (!await _db.ProjectTeams.AnyAsync(pt => pt.ProjectId == projectId && pt.TeamId == teamId))
                _db.ProjectTeams.Add(new ProjectTeam { ProjectId = projectId, TeamId = teamId });

            await _db.SaveChangesAsync();
        }

        public async Task RemoveTeamAsync(int projectId, int teamId)
        {
            var pt = await _db.ProjectTeams.FirstOrDefaultAsync(x => x.ProjectId == projectId && x.TeamId == teamId);
            if (pt != null)
            {
                _db.ProjectTeams.Remove(pt);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<List<ProjectDto>> GetProjectsByTeamAsync(int teamId) =>
            (await _db.Projects.Include(p => p.Creator)
                .Include(p => p.ProjectTeams).ThenInclude(pt => pt.Team).ThenInclude(t => t.Leader)
                .Where(p => !p.IsDeleted && p.ProjectTeams.Any(pt => pt.TeamId == teamId))
                .ToListAsync())
            .Select(Map).ToList();

        public async Task<List<ProjectDto>> GetProjectsByUserAsync(int userId) =>
            (await _db.Projects.Include(p => p.Creator)
                .Include(p => p.ProjectTeams).ThenInclude(pt => pt.Team).ThenInclude(t => t.Leader)
                .Where(p => !p.IsDeleted && p.ProjectTeams.Any(pt =>
                    pt.Team.TeamMembers.Any(tm => tm.UserId == userId) || pt.Team.LeaderId == userId))
                .ToListAsync())
            .Select(Map).ToList();

        private static ProjectDto Map(Project p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Status = p.Status,
            CreatedBy = p.CreatedBy,
            CreatedByName = $"{p.Creator.FirstName} {p.Creator.LastName}",
            CreatedAt = p.CreatedAt,
            Teams = p.ProjectTeams.Select(pt => new TeamDto
            {
                Id = pt.Team.Id,
                Name = pt.Team.Name,
                LeaderId = pt.Team.LeaderId,
                LeaderName = $"{pt.Team.Leader.FirstName} {pt.Team.Leader.LastName}",
                Members = pt.Team.TeamMembers.Select(tm => new UserDto
                {
                    Id = tm.User.Id,
                    FirstName = tm.User.FirstName,
                    LastName = tm.User.LastName,
                    Email = tm.User.Email,
                    Role = tm.User.Role
                }).ToList()
            }).ToList()
        };
    }
}   