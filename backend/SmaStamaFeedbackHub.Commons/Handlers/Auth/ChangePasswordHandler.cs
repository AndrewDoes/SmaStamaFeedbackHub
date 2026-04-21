using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Requests.Auth;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Auth;

public class ChangePasswordCommand : ChangePasswordRequest, IRequest<bool>;

public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public ChangePasswordHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _userContext.UserId, cancellationToken);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            throw new ValidationException("Passwords do not match.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.MustChangePassword = false;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
