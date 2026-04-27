using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Controllers
{
    [Route("api/auth")]
    public class AuthController : BaseController
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) => _auth = auth;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto) =>
            Ok(await _auth.LoginAsync(dto));
 
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto) =>
                Ok(await _auth.RegisterAsync(dto));

        [HttpGet("me"), Authorize]
        public IActionResult Me() => Ok(new
        {
            id = CurrentUserId,
            role = CurrentRole,
            name = $"{User.FindFirstValue("firstName")} {User.FindFirstValue("lastName")}"
        });
    }
}