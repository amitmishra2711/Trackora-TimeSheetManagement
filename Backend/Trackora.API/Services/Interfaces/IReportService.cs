using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface IReportService
    {
        Task<List<DailyReportDto>> GetAllAsync(int? teamId);
        Task<DailyReportDto> GetByIdAsync(int id);
        Task<DailyReportDto> CreateAsync(CreateDailyReportDto dto, int leaderId);
        Task<byte[]> ExportTimesheetsExcelAsync(int? userId, int? projectId, DateTime? from, DateTime? to, int adminId);
        Task<byte[]> ExportTimesheetsPdfAsync(int? userId, int? projectId, DateTime? from, DateTime? to, int adminId);
    }
}