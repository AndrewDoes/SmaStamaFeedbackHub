using System;

namespace SmaStamaFeedbackHub.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Link { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;
}
