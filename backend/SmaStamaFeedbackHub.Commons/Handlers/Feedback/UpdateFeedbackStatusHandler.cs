using MediatR;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class UpdateFeedbackStatusCommand : IRequest
{
    public Guid Id { get; set; }
    public FeedbackStatus Status { get; set; }
    public string? Resolution { get; set; }
    public bool? IsDenied { get; set; }
}

public class UpdateFeedbackStatusHandler : IRequestHandler<UpdateFeedbackStatusCommand>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly INotificationService _notificationService;

    public UpdateFeedbackStatusHandler(AppDbContext context, IUserContext userContext, INotificationService notificationService)
    {
        _context = context;
        _userContext = userContext;
        _notificationService = notificationService;
    }

    public async Task Handle(UpdateFeedbackStatusCommand request, CancellationToken cancellationToken)
    {
        // 1. Strict Authorization: Only Administrators can change status
        if (_userContext.Role != UserRole.Administrator)
        {
            throw new UnauthorizedAccessException("Access Denied: Only administrators can update feedback status.");
        }

        var feedback = await _context.Feedbacks.FindAsync(new object[] { request.Id }, cancellationToken);
        if (feedback == null)
        {
            throw new KeyNotFoundException("Feedback record not found.");
        }

        // 2. Record transition for auditing
        var oldStatus = feedback.Status;
        
        // 3. Apply status change
        feedback.Status = request.Status;

        // 4. Handle Resolution
        if (request.Status == FeedbackStatus.Resolved)
        {
            if (string.IsNullOrWhiteSpace(request.Resolution))
            {
                throw new ArgumentException("A resolution message is required when marking feedback as resolved.");
            }
            feedback.Resolution = request.Resolution;
            feedback.ResolvedAt = DateTime.UtcNow;
            feedback.IsDenied = request.IsDenied ?? false;
        }

        _context.FeedbackLogs.Add(new FeedbackLog
        {
            Id = Guid.NewGuid(),
            FeedbackId = feedback.Id,
            AdminId = _userContext.UserId,
            Action = "StatusUpdate",
            OldValue = oldStatus.ToString(),
            NewValue = request.Status.ToString(),
            CreatedAt = DateTime.UtcNow
        });
        
        // 5. Notify Student
        if (oldStatus != request.Status)
        {
            string statusText = request.Status switch
            {
                FeedbackStatus.Open => "Active",
                FeedbackStatus.InProgress => "In Progress",
                FeedbackStatus.Resolved => request.IsDenied == true ? "Denied" : "Fulfilled",
                _ => "Updated"
            };

            await _notificationService.SendNotificationAsync(
                feedback.OwnerId,
                $"Feedback {statusText}",
                $"Your feedback thread '{feedback.Title}' has been moved to {statusText}.",
                $"/feedback/{feedback.Id}"
            );
        }
        
        await _context.SaveChangesAsync(cancellationToken);
    }
}
