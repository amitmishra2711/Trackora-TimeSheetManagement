using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Trackora.API.Controllers
{
    [ApiController]
    public abstract class BaseController : ControllerBase
    {
        protected int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        protected string CurrentRole => User.FindFirstValue(ClaimTypes.Role)!;
    }
}