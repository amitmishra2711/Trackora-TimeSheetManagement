using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface IProjectService
    {
        Task<PagedResult<ProjectDto>> GetAllAsync(PaginationQuery query);
        Task<ProjectDto> GetByIdAsync(int id);
        Task<ProjectDto> CreateAsync(CreateProjectDto dto, int adminId);
        Task<ProjectDto> UpdateAsync(int id, UpdateProjectDto dto);
        Task DeleteAsync(int id);
        Task AssignTeamAsync(int projectId, int teamId);
        Task RemoveTeamAsync(int projectId, int teamId);
        Task<List<ProjectDto>> GetProjectsByTeamAsync(int teamId);
        Task<List<ProjectDto>> GetProjectsByUserAsync(int userId);
    }
}