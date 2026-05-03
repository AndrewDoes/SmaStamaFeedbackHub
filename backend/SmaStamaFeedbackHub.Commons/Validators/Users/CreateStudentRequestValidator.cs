using FluentValidation;
using SmaStamaFeedbackHub.Commons.Handlers.Users;

namespace SmaStamaFeedbackHub.Commons.Validators.Users;

public class CreateStudentRequestValidator : AbstractValidator<CreateStudentCommand>
{
    public CreateStudentRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Kode siswa wajib diisi.")
            .MaximumLength(20).WithMessage("Kode siswa maksimal 20 karakter.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Nama lengkap wajib diisi.")
            .MaximumLength(100).WithMessage("Nama lengkap maksimal 100 karakter.");

        RuleFor(x => x.BatchYear)
            .InclusiveBetween(2000, 2100).WithMessage("Tahun angkatan tidak valid.");
    }
}
