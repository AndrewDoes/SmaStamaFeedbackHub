using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaStamaFeedbackHub.Commons;
using System.Security.Claims;

namespace SmaStamaFeedbackHub.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthDebugController : ControllerBase
{
    private readonly IUserContext _userContext;

    public AuthDebugController(IUserContext userContext)
    {
        _userContext = userContext;
    }

    [Authorize]
    [HttpGet("whoami")]
    public IActionResult WhoAmI()
    {
        return Ok(new
        {
            UserId = _userContext.UserId,
            Role = _userContext.Role.ToString(),
            Code = _userContext.Code,
            Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
        });
    }
}
