using System.ComponentModel.DataAnnotations;

namespace SmaStamaFeedbackHub.Entities;

public class FeedbackAttachment
{
    public Guid Id { get; set; }
    
    [Required]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    public string BlobUrl { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid FeedbackId { get; set; }
    public Feedback Feedback { get; set; } = null!;
}
