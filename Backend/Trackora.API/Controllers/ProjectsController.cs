using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/projects"), Authorize]
    public class ProjectsController : BaseController
    {
        private readonly IProjectService _projects;
        private readonly IActivityLogService _log;

        public ProjectsController(IProjectService projects, IActivityLogService log)
        {
            _projects = projects;
            _log = log;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationQuery q) =>
            Ok(await _projects.GetAllAsync(q));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) =>
            Ok(await _projects.GetByIdAsync(id));

        [HttpGet("my")]
        public async Task<IActionResult> GetMine() =>
            Ok(await _projects.GetProjectsByUserAsync(CurrentUserId));

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            var result = await _projects.CreateAsync(dto, CurrentUserId);
            await _log.LogAsync(CurrentUserId, "CreateProject", $"Created project {dto.Name}");
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto) =>
            Ok(await _projects.UpdateAsync(id, dto));

        [HttpDelete("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _projects.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/teams/{teamId}")]
        public async Task<IActionResult> AssignTeam(int id, int teamId)
        {
            await _projects.AssignTeamAsync(id, teamId);
            return Ok();
        }

        [HttpDelete("{id}/teams/{teamId}")]
        public async Task<IActionResult> RemoveTeam(int id, int teamId)
        {
            await _projects.RemoveTeamAsync(id, teamId);
            return NoContent();
        }
    }
}