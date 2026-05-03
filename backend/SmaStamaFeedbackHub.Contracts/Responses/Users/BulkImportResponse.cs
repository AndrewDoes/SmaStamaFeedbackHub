namespace SmaStamaFeedbackHub.Contracts.Responses.Users;

public class ImportedStudentDetail
{
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string InitialPassword { get; set; } = string.Empty;
}

public class BulkImportResponse
{
    public int ImportedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<ImportedStudentDetail> ImportedStudents { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}
