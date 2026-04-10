using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface ITeamService
    {
        Task<PagedResult<TeamDto>> GetAllAsync(PaginationQuery query);
        Task<TeamDto> GetByIdAsync(int id);
        Task<TeamDto> CreateAsync(CreateTeamDto dto, int adminId);
        Task<TeamDto> UpdateAsync(int id, UpdateTeamDto dto);
        Task DeleteAsync(int id);
        Task<TeamDto> AddMemberAsync(int teamId, int userId);
        Task RemoveMemberAsync(int teamId, int userId);
        Task<List<TeamDto>> GetTeamsByLeaderAsync(int leaderId);
        
        Task<TeamDto?> GetTeamByMemberAsync(int userId);
    }
}