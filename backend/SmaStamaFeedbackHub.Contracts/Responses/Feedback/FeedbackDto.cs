using SmaStamaFeedbackHub.Contracts.Enums;

namespace SmaStamaFeedbackHub.Contracts.Responses.Feedback;

public class FeedbackDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFlagged { get; set; }
    public FeedbackStatus Status { get; set; }
    public FeedbackCategory Category { get; set; }
    public string? Resolution { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsDenied { get; set; }
    public List<FeedbackDto> Replies { get; set; } = new();
    public List<string> AttachmentUrls { get; set; } = new();
    public bool IsStaffResponse { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public bool IsAuthor { get; set; }
    public List<FeedbackLogDto>? AuditLogs { get; set; }
}
