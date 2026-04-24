using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface ITimesheetAnalyticsService
    {
        Task<TimesheetAnalyticsDto> GetAnalyticsAsync(TimesheetFilterDto filter, int? leaderId = null);
        Task<byte[]> ExportToExcelAsync(TimesheetFilterDto filter, int? leaderId = null);
    }
}
