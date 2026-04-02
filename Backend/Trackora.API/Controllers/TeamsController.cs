using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/teams"), Authorize]
    public class TeamsController : BaseController
    {
        private readonly ITeamService _teams;

        public TeamsController(ITeamService teams)
        {
            _teams = teams;
        }

       

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationQuery q) =>
            Ok(await _teams.GetAllAsync(q));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) =>
            Ok(await _teams.GetByIdAsync(id));

        [HttpGet("my")]
        public async Task<IActionResult> GetMyTeam() =>
            Ok(await _teams.GetTeamByMemberAsync(CurrentUserId));

        [HttpGet("leading")]
        public async Task<IActionResult> GetLeading() =>
            Ok(await _teams.GetTeamsByLeaderAsync(CurrentUserId));

        [HttpPost, Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateTeamDto dto)
        {
            var result = await _teams.CreateAsync(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTeamDto dto) =>
            Ok(await _teams.UpdateAsync(id, dto));

        [HttpDelete("{id}"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _teams.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/members"), Authorize(Roles = "Admin,Leader")]
        public async Task<IActionResult> AddMember(int id, [FromBody] AddMemberDto dto) =>
            Ok(await _teams.AddMemberAsync(id, dto.UserId));

        [HttpDelete("{id}/members/{userId}"), Authorize(Roles = "Admin,Leader")]
        public async Task<IActionResult> RemoveMember(int id, int userId)
        {
            await _teams.RemoveMemberAsync(id, userId);
            return NoContent();
        }
    }
}