namespace SmaStamaFeedbackHub.Contracts.Requests;

public class SubmitFeedbackRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
