using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface ITimesheetService
    {
       
        Task<PagedResult<TimesheetDto>> GetAllAsync(PaginationQuery query, int? userId, int? projectId);
        Task<TimesheetDto> GetByIdAsync(int id);
        Task<TimesheetDto> CreateAsync(CreateTimesheetDto dto, int userId);
        Task<TimesheetDto> UpdateAsync(int id, UpdateTimesheetDto dto, int userId);
        Task DeleteAsync(int id, int userId);
        Task<TimesheetDto> ApproveAsync(int id, string status, int leaderId);
        Task<List<TimesheetDto>> GetByTeamAsync(int teamId);
        Task<List<TimesheetDto>> GetMyTimesheetsAsync(int userId);
        Task<List<TimesheetDto>> GetByMemberAndProjectAsync(int userId, int projectId);
        Task<List<TimesheetDto>> GetByLeaderTeamsAsync(int leaderId);
    }
}