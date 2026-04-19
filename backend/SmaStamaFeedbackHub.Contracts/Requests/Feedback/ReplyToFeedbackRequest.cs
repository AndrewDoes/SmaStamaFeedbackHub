namespace SmaStamaFeedbackHub.Contracts.Requests.Feedback;

public class ReplyToFeedbackRequest
{
    public Guid ParentId { get; set; }
    public string Content { get; set; } = string.Empty;
}
