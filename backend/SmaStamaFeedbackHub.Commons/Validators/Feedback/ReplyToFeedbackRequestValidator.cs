using FluentValidation;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;

namespace SmaStamaFeedbackHub.Commons.Validators.Feedback;

public class ReplyToFeedbackRequestValidator : AbstractValidator<ReplyToFeedbackRequest>
{
    public ReplyToFeedbackRequestValidator()
    {
        RuleFor(x => x.ParentId).NotEmpty().WithMessage("Parent feedback ID is required.");
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Reply content is required.")
            .MinimumLength(5).WithMessage("Reply must be at least 5 characters long.");
    }
}
