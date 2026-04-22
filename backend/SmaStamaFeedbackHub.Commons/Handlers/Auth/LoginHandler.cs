using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons;
using SmaStamaFeedbackHub.Contracts.Requests.Auth;
using SmaStamaFeedbackHub.Contracts.Responses.Auth;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Auth;

public class LoginCommand : LoginRequest, IRequest<LoginResponse>;

public class LoginHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public LoginHandler(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid code or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Your account has been deactivated. Please contact the administration.");
        }

        var token = _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            Role = user.Role.ToString(),
            FullName = user.FullName,
            MustChangePassword = user.MustChangePassword,
            UserId = user.Id,
            Code = user.Code
        };
    }
}
