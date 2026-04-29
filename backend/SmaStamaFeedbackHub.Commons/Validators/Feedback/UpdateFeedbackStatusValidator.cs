using FluentValidation;
using SmaStamaFeedbackHub.Commons.Handlers.Feedback;

namespace SmaStamaFeedbackHub.Commons.Validators.Feedback;

public class UpdateFeedbackStatusValidator : AbstractValidator<UpdateFeedbackStatusCommand>
{
    public UpdateFeedbackStatusValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Feedback ID is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid feedback status.");

        RuleFor(x => x.Resolution)
            .NotEmpty()
            .When(x => x.Status == SmaStamaFeedbackHub.Contracts.Enums.FeedbackStatus.Resolved)
            .WithMessage("A resolution conclusion is required when marking feedback as resolved.");
    }
}
