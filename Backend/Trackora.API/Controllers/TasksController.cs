using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/tasks"), Authorize]
    public class TasksController : BaseController
    {
        private readonly ITaskService _tasks;
        public TasksController(ITaskService tasks) => _tasks = tasks;
 
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationQuery q, [FromQuery] int? projectId)
        {
            // Leaders only see tasks belonging to their own team — enforced at service level
            int? leaderId = CurrentRole == "Leader" ? CurrentUserId : null;
            return Ok(await _tasks.GetAllAsync(q, projectId, leaderId));
        }
 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) => Ok(await _tasks.GetByIdAsync(id));
 
        [HttpGet("my")]
        public async Task<IActionResult> GetMine() => Ok(await _tasks.GetTasksByUserAsync(CurrentUserId));
 
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(int projectId) =>
            Ok(await _tasks.GetTasksByProjectAsync(projectId));
 
        [HttpPost, Authorize(Roles = "Admin,Leader")]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto) =>
            Ok(await _tasks.CreateAsync(dto, CurrentUserId));
 
        [HttpPut("{id}"), Authorize(Roles = "Admin,Leader")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto dto) =>
            Ok(await _tasks.UpdateAsync(id, dto));
 
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTaskStatusDto dto) =>
            Ok(await _tasks.UpdateStatusAsync(id, dto.Status));
 
        [HttpDelete("{id}"), Authorize(Roles = "Admin,Leader")]
        public async Task<IActionResult> Delete(int id)
        {
            await _tasks.DeleteAsync(id); return NoContent();
        }
    }

}