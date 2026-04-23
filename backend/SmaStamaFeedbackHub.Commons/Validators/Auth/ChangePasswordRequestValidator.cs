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
            .MinimumLength(6).WithMessage("New password must be at least 6 characters long.")
            .NotEqual(x => x.OldPassword).WithMessage("New password cannot be the same as the current password.");
    }
}
