using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/activity"), Authorize(Roles = "Admin")]
    public class ActivityController : BaseController
    {
        private readonly IActivityLogService _log;

        public ActivityController(IActivityLogService log) => _log = log;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationQuery q) =>
            Ok(await _log.GetAllAsync(q));
    }
}