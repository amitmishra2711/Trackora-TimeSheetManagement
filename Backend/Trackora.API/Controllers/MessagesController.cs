using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/messages"), Authorize]
    public class MessagesController : BaseController
    {
        private readonly IMessageService _msgs;

        public MessagesController(IMessageService msgs) => _msgs = msgs;

        [HttpGet("direct/{otherId}")]
        public async Task<IActionResult> GetDirect(int otherId) =>
            Ok(await _msgs.GetDirectMessagesAsync(CurrentUserId, otherId));

        [HttpGet("team/{teamId}")]
        public async Task<IActionResult> GetTeam(int teamId) =>
            Ok(await _msgs.GetTeamMessagesAsync(teamId));
    }
}