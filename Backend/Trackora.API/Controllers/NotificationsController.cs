using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/notifications"), Authorize]
    public class NotificationsController : BaseController
    {
        private readonly INotificationService _notify;

        public NotificationsController(INotificationService notify) => _notify = notify;

        [HttpGet]
        public async Task<IActionResult> GetMine() =>
            Ok(await _notify.GetUserNotificationsAsync(CurrentUserId));

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            await _notify.MarkReadAsync(id, CurrentUserId);
            return Ok();
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllRead()
        {
            await _notify.MarkAllReadAsync(CurrentUserId);
            return Ok();
        }
    }
}