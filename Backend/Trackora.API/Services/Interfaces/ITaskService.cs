using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface ITaskService
    {
        Task<PagedResult<TaskDto>> GetAllAsync(PaginationQuery query, int? projectId, int? leaderId = null);
        Task<TaskDto> GetByIdAsync(int id);
        Task<TaskDto> CreateAsync(CreateTaskDto dto, int assignedBy);
        Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto);
        Task DeleteAsync(int id);
        Task<TaskDto> UpdateStatusAsync(int id, string status);
        Task<List<TaskDto>> GetTasksByUserAsync(int userId);
        Task<List<TaskDto>> GetTasksByProjectAsync(int projectId);
    }
}