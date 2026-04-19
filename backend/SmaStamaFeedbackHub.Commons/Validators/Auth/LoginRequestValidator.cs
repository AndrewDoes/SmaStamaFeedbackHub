using FluentValidation;
using SmaStamaFeedbackHub.Contracts.Auth.Requests;
    
namespace SmaStamaFeedbackHub.Commons.Validators.Auth;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().WithMessage("User code is required.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}
