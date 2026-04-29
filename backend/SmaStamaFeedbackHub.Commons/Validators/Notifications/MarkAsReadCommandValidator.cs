using FluentValidation;
using SmaStamaFeedbackHub.Commons.Handlers.Notifications;

namespace SmaStamaFeedbackHub.Commons.Validators.Notifications;

public class MarkAsReadCommandValidator : AbstractValidator<MarkAsReadCommand>
{
    public MarkAsReadCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Notification ID is required.");
    }
}
