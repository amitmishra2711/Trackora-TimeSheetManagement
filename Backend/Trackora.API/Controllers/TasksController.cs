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
        public async Task<IActionResult> GetAll([FromQuery] PaginationQuery q, int? projectId) =>
            Ok(await _tasks.GetAllAsync(q, projectId));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) =>
            Ok(await _tasks.GetByIdAsync(id));

        [HttpGet("my")]
        public async Task<IActionResult> GetMine() =>
            Ok(await _tasks.GetTasksByUserAsync(CurrentUserId));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTaskDto dto) =>
            Ok(await _tasks.CreateAsync(dto, CurrentUserId));

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTaskStatusDto dto) =>
        Ok(await _tasks.UpdateStatusAsync(id, dto.Status));
    }

}