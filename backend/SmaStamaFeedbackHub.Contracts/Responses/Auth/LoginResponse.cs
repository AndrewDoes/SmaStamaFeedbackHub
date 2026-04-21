namespace SmaStamaFeedbackHub.Contracts.Responses.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool MustChangePassword { get; set; }
    public Guid UserId { get; set; }
    public string Code { get; set; } = string.Empty;
}
