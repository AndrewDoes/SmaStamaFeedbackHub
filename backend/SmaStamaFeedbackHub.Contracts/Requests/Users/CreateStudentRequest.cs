namespace SmaStamaFeedbackHub.Contracts.Requests.Users;

public class CreateStudentRequest
{
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int BatchYear { get; set; }
}
