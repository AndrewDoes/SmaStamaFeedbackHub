using SmaStamaFeedbackHub.Contracts.Enums;

namespace SmaStamaFeedbackHub.Entities;

public class FeedbackLog
{
    public Guid Id { get; set; }
    
    public Guid FeedbackId { get; set; }
    public Feedback Feedback { get; set; } = null!;
    
    public Guid AdminId { get; set; }
    public User Admin { get; set; } = null!;
    
    public string Action { get; set; } = string.Empty; // e.g., "StatusUpdate"
    
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
