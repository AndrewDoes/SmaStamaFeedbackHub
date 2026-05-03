namespace SmaStamaFeedbackHub.Contracts.Requests.Users;

public class GetStudentListRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
}
