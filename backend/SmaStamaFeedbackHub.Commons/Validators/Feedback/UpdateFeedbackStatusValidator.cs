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
            .IsInEnum().WithMessage("Invalid feedback status. Must be Open (0), InProgress (1), Resolved (2), or Closed (3).");
    }
}
