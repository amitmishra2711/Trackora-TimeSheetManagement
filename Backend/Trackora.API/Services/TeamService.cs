using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Models;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Services
{
    public class TeamService : ITeamService
    {
        private readonly AppDbContext _db;
        public TeamService(AppDbContext db) => _db = db;

        public async Task<PagedResult<TeamDto>> GetAllAsync(PaginationQuery query)
        {
            var q = _db.Teams
                .Include(t => t.Leader)
                .Include(t => t.TeamMembers).ThenInclude(tm => tm.User)
                .Where(t => !t.IsDeleted);

            if (!string.IsNullOrEmpty(query.Search))
                q = q.Where(t => t.Name.Contains(query.Search));

            var total = await q.CountAsync();

            var items = await q.OrderByDescending(t => t.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new PagedResult<TeamDto>
            {
                Items = items.Select(Map).ToList(),
                TotalCount = total,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        public async Task<TeamDto> GetByIdAsync(int id)
        {
            var team = await _db.Teams
                .Include(t => t.Leader)
                .Include(t => t.TeamMembers).ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted)
                ?? throw new KeyNotFoundException("Team not found.");

            return Map(team);
        }

        public async Task<TeamDto> CreateAsync(CreateTeamDto dto, int adminId)
        {
            var team = new Team { Name = dto.Name, LeaderId = dto.LeaderId };

            _db.Teams.Add(team);
            await _db.SaveChangesAsync();

            foreach (var uid in dto.MemberIds)
                _db.TeamMembers.Add(new TeamMember { TeamId = team.Id, UserId = uid });

            await _db.SaveChangesAsync();

            return await GetByIdAsync(team.Id);
        }

        public async Task<TeamDto> UpdateAsync(int id, UpdateTeamDto dto)
        {
            var team = await _db.Teams.FindAsync(id)
                ?? throw new KeyNotFoundException("Team not found.");

            team.Name = dto.Name;
            team.LeaderId = dto.LeaderId;

            await _db.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task DeleteAsync(int id)
        {
            var team = await _db.Teams.FindAsync(id)
                ?? throw new KeyNotFoundException("Team not found.");

            team.IsDeleted = true;
            await _db.SaveChangesAsync();
        }

        public async Task<TeamDto> AddMemberAsync(int teamId, int userId)
        {
            if (!await _db.TeamMembers.AnyAsync(tm => tm.TeamId == teamId && tm.UserId == userId))
                _db.TeamMembers.Add(new TeamMember { TeamId = teamId, UserId = userId });

            await _db.SaveChangesAsync();
            return await GetByIdAsync(teamId);
        }

        public async Task RemoveMemberAsync(int teamId, int userId)
        {
            var member = await _db.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == teamId && tm.UserId == userId);

            if (member != null)
            {
                _db.TeamMembers.Remove(member);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<List<TeamDto>> GetTeamsByLeaderAsync(int leaderId) =>
            (await _db.Teams
                .Include(t => t.Leader)
                .Include(t => t.TeamMembers).ThenInclude(tm => tm.User)
                .Where(t => t.LeaderId == leaderId && !t.IsDeleted)
                .ToListAsync())
            .Select(Map).ToList();

        public async Task<TeamDto?> GetTeamByMemberAsync(int userId)
        {
            var member = await _db.TeamMembers
                .Include(tm => tm.Team).ThenInclude(t => t.Leader)
                .Include(tm => tm.Team).ThenInclude(t => t.TeamMembers).ThenInclude(x => x.User)
                .FirstOrDefaultAsync(tm => tm.UserId == userId && !tm.Team.IsDeleted);

            return member != null ? Map(member.Team) : null;
        }

        private static TeamDto Map(Team t) => new()
        {
            Id = t.Id,
            Name = t.Name,
            LeaderId = t.LeaderId,
            LeaderName = $"{t.Leader.FirstName} {t.Leader.LastName}",
            Members = t.TeamMembers.Select(tm => new UserDto
            {
                Id = tm.User.Id,
                FirstName = tm.User.FirstName,
                LastName = tm.User.LastName,
                Email = tm.User.Email,
                Role = tm.User.Role,
                IsActive = tm.User.IsActive
            }).ToList(),
            CreatedAt = t.CreatedAt
        };
    }
}