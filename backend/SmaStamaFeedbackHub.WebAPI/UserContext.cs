using System.Security.Claims;
using SmaStamaFeedbackHub.Commons;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.WebAPI;

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId => Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());

    public UserRole Role => Enum.Parse<UserRole>(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role) ?? UserRole.Student.ToString());

    public string Code => _httpContextAccessor.HttpContext?.User.FindFirstValue("Code") ?? string.Empty;
}
