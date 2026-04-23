using System;
using System.Threading.Tasks;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task SendNotificationAsync(Guid userId, string title, string message, string? link = null)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Message = message,
            Link = link,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }
}
