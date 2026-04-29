using System;
using System.Threading.Tasks;

namespace SmaStamaFeedbackHub.Commons.Services;

public interface INotificationService
{
    Task SendNotificationAsync(Guid userId, string title, string message, string? link = null);
}
