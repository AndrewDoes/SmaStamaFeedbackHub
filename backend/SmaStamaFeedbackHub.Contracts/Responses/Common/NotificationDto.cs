using System;

namespace SmaStamaFeedbackHub.Contracts.Responses.Common;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Link { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
