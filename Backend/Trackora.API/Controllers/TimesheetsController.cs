using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/timesheets"), Authorize]
    public class TimesheetsController : BaseController
    {
       private readonly ITimesheetService _ts;
        public TimesheetsController(ITimesheetService ts) => _ts = ts;
 
        [HttpGet, Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] PaginationQuery q, [FromQuery] int? userId, [FromQuery] int? projectId) =>
            Ok(await _ts.GetAllAsync(q, userId, projectId));
 
        [HttpGet("my")]
        public async Task<IActionResult> GetMine() => Ok(await _ts.GetMyTimesheetsAsync(CurrentUserId));
 
        [HttpGet("team/{teamId}"), Authorize(Roles = "Admin,Leader")]
        public async Task<IActionResult> GetByTeam(int teamId) => Ok(await _ts.GetByTeamAsync(teamId));
 
        
        [HttpGet("member/{userId}/project/{projectId}"), Authorize(Roles = "Admin,Leader")]
        public async Task<IActionResult> GetByMemberAndProject(int userId, int projectId) =>
            Ok(await _ts.GetByMemberAndProjectAsync(userId, projectId));
 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) => Ok(await _ts.GetByIdAsync(id));
 
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTimesheetDto dto) =>
            Ok(await _ts.CreateAsync(dto, CurrentUserId));
 
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTimesheetDto dto) =>
            Ok(await _ts.UpdateAsync(id, dto, CurrentUserId));
 
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _ts.DeleteAsync(id, CurrentUserId); return NoContent();
        }
 
        [HttpPatch("{id}/approve"), Authorize(Roles = "Leader,Admin")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApproveTimesheetDto dto) =>
            Ok(await _ts.ApproveAsync(id, dto.Status, CurrentUserId));

             [HttpGet("my-teams"), Authorize(Roles = "Leader")]
        public async Task<IActionResult> GetByMyTeams() =>
            Ok(await _ts.GetByLeaderTeamsAsync(CurrentUserId));

    }
}