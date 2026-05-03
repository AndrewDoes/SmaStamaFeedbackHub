namespace SmaStamaFeedbackHub.Contracts.Responses.Users;

public class StudentResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int? BatchYear { get; set; }
    public bool IsActive { get; set; }
    public int FeedbackCount { get; set; }
}
