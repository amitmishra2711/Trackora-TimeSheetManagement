using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/users"), Authorize]
    public class UsersController : BaseController
    {
        private readonly IUserService _users;

        public UsersController(IUserService users)
        {
            _users = users;
        }

        [HttpGet, Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] PaginationQuery q) =>
            Ok(await _users.GetAllAsync(q));

        [HttpGet("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id) =>
            Ok(await _users.GetByIdAsync(id));

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees() =>
            Ok(await _users.GetEmployeesAsync());

        [HttpGet("leaders")]
        public async Task<IActionResult> GetLeaders() =>
            Ok(await _users.GetLeadersAsync());

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            var result = await _users.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            var result = await _users.UpdateAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _users.DeleteAsync(id);
            return NoContent();
        }
    }
}