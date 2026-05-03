using FluentValidation;
using SmaStamaFeedbackHub.Commons.Handlers.Users;

namespace SmaStamaFeedbackHub.Commons.Validators.Users;

public class BulkImportStudentsRequestValidator : AbstractValidator<BulkImportStudentsCommand>
{
    public BulkImportStudentsRequestValidator()
    {
        RuleFor(x => x.File)
            .NotNull().WithMessage("File CSV wajib diunggah.")
            .Must(x => x != null && x.Length > 0).WithMessage("File CSV tidak boleh kosong.")
            .Must(x => x != null && (x.FileName.EndsWith(".csv") || x.ContentType == "text/csv"))
            .WithMessage("Hanya file CSV yang diperbolehkan.");
    }
}
