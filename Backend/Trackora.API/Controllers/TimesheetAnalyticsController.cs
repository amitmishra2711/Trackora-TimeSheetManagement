using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
[Route("api/timesheet-analytics"), Authorize]
    public class TimesheetAnalyticsController : BaseController
    {
        private readonly ITimesheetAnalyticsService _analytics;
        public TimesheetAnalyticsController(ITimesheetAnalyticsService analytics)
            => _analytics = analytics;
 
       
        [HttpGet]
        public async Task<IActionResult> GetAnalytics(
            [FromQuery] int? employeeId,
            [FromQuery] int? projectId,
            [FromQuery] int? teamId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var filter = new TimesheetFilterDto
            {
                EmployeeId = employeeId,
                ProjectId  = projectId,
                TeamId     = teamId,
                StartDate  = startDate,
                EndDate    = endDate
            };
 
            int? leaderId = CurrentRole == "Leader" ? CurrentUserId : null;
            return Ok(await _analytics.GetAnalyticsAsync(filter, leaderId));
        }
 
      
        [HttpGet("export")]
        public async Task<IActionResult> Export(
            [FromQuery] int? employeeId,
            [FromQuery] int? projectId,
            [FromQuery] int? teamId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var filter = new TimesheetFilterDto
            {
                EmployeeId = employeeId,
                ProjectId  = projectId,
                TeamId     = teamId,
                StartDate  = startDate,
                EndDate    = endDate
            };
 
            int? leaderId = CurrentRole == "Leader" ? CurrentUserId : null;
            var bytes = await _analytics.ExportToExcelAsync(filter, leaderId);
 
            var fileName = $"trackora_timesheets_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";
            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName);
        }
    }
}
