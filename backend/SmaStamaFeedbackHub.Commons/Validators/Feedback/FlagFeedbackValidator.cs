using FluentValidation;
using SmaStamaFeedbackHub.Commons.Handlers.Feedback;

namespace SmaStamaFeedbackHub.Commons.Validators.Feedback;

public class FlagFeedbackValidator : AbstractValidator<FlagFeedbackCommand>
{
    public FlagFeedbackValidator()
    {
        RuleFor(x => x.FeedbackId)
            .NotEmpty().WithMessage("Feedback ID is required.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason for flagging is required.")
            .MinimumLength(5).WithMessage("Reason must be at least 5 characters long.")
            .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters.");
    }
}
