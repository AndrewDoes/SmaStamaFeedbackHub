using System.ComponentModel.DataAnnotations;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Entities;

public class Feedback
{
    public Guid Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    
    // Threading
    public Guid? ParentId { get; set; }
    public Feedback? Parent { get; set; }
    public List<Feedback> Replies { get; set; } = new();

    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }

    public FeedbackStatus Status { get; set; } = FeedbackStatus.Open;
    public FeedbackCategory Category { get; set; } = FeedbackCategory.Lainnya;
    
    public string? Resolution { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsDenied { get; set; }

    public List<FeedbackAttachment> Attachments { get; set; } = new();
    public List<FeedbackLog> Logs { get; set; } = new();
}
