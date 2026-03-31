using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/reports"), Authorize]
    public class ReportsController : BaseController
    {
        private readonly IReportService _reports;

        public ReportsController(IReportService reports) => _reports = reports;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? teamId) =>
            Ok(await _reports.GetAllAsync(teamId));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) =>
            Ok(await _reports.GetByIdAsync(id));

        [HttpPost, Authorize(Roles = "Leader")]
        public async Task<IActionResult> Create([FromBody] CreateDailyReportDto dto) =>
            Ok(await _reports.CreateAsync(dto, CurrentUserId));

        [HttpGet("export/excel"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportExcel(
            [FromQuery] int? userId,
            [FromQuery] int? projectId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var bytes = await _reports.ExportTimesheetsExcelAsync(userId, projectId, from, to, CurrentUserId);

            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"timesheets_{DateTime.Now:yyyyMMdd}.xlsx");
        }

        [HttpGet("export/pdf"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportPdf(
            [FromQuery] int? userId,
            [FromQuery] int? projectId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var bytes = await _reports.ExportTimesheetsPdfAsync(userId, projectId, from, to, CurrentUserId);

            return File(bytes, "text/html", $"timesheets_{DateTime.Now:yyyyMMdd}.html");
        }
    }
}