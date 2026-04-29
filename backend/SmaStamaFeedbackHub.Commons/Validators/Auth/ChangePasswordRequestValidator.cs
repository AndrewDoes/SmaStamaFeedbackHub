using FluentValidation;
using SmaStamaFeedbackHub.Contracts.Requests.Auth;

namespace SmaStamaFeedbackHub.Commons.Validators.Auth;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.OldPassword)
            .NotEmpty().WithMessage("Current password is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("New password must be at least 8 characters long.")
            .Matches(@"[A-Z]").WithMessage("New password must contain at least one uppercase letter.")
            .Matches(@"[0-9]").WithMessage("New password must contain at least one number.")
            .Matches(@"[\W_]").WithMessage("New password must contain at least one special character.")
            .NotEqual(x => x.OldPassword).WithMessage("New password cannot be the same as the current password.");
    }
}
