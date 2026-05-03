using FluentValidation;
using SmaStamaFeedbackHub.Commons.Handlers.Users;

namespace SmaStamaFeedbackHub.Commons.Validators.Users;

public class DeleteStudentRequestValidator : AbstractValidator<DeleteStudentCommand>
{
    public DeleteStudentRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID siswa wajib diisi.");
    }
}
