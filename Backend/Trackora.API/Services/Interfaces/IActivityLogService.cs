using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface IActivityLogService
    {
        Task<PagedResult<ActivityLogDto>> GetAllAsync(PaginationQuery query);
        Task LogAsync(int userId, string action, string? details = null);
    }
}