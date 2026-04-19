namespace SmaStamaFeedbackHub.Contracts.Responses;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;

    public LoginResponse() { }

    public LoginResponse(string token, string role, string fullName)
    {
        Token = token;
        Role = role;
        FullName = fullName;
    }
}
