namespace SmaStamaFeedbackHub.Contracts.Feedback.Responses;

public class AdminFeedbackDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerCode { get; set; } = string.Empty;
    public string OwnerFullName { get; set; } = string.Empty;
}
