namespace SmaStamaFeedbackHub.Contracts.Requests.Feedback;

public class FlagFeedbackRequest
{
    public Guid FeedbackId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
