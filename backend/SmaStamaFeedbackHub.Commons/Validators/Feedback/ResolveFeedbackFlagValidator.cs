using FluentValidation;
using SmaStamaFeedbackHub.Commons.Handlers.Feedback;

namespace SmaStamaFeedbackHub.Commons.Validators.Feedback;

public class ResolveFeedbackFlagValidator : AbstractValidator<ResolveFeedbackFlagCommand>
{
    public ResolveFeedbackFlagValidator()
    {
        RuleFor(x => x.FeedbackId)
            .NotEmpty().WithMessage("Feedback ID is required.");
    }
}
