namespace SmaStamaFeedbackHub.Contracts.Responses.Feedback;

public class FeedbackLogDto
{
    public Guid Id { get; set; }
    public string AdminName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
