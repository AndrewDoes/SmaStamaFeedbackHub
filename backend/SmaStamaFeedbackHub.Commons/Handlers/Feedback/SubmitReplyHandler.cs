using MediatR;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class SubmitReplyCommand : ReplyToFeedbackRequest, IRequest<Guid>
{
    public string Title => ""; // Replies don't have titles
}

public class SubmitReplyHandler : IRequestHandler<SubmitReplyCommand, Guid>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly INotificationService _notificationService;

    public SubmitReplyHandler(AppDbContext context, IUserContext userContext, INotificationService notificationService)
    {
        _context = context;
        _userContext = userContext;
        _notificationService = notificationService;
    }

    public async Task<Guid> Handle(SubmitReplyCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if parent exists
        var parent = await _context.Feedbacks.FindAsync(request.ParentId);
        if (parent == null) throw new KeyNotFoundException("The feedback you are replying to does not exist.");

        // 3. Create reply (which is just a Feedback with a ParentId)
        var reply = new Entities.Feedback
        {
            Id = Guid.NewGuid(),
            Title = $"RE: {parent.Title}",
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            OwnerId = _userContext.UserId,
            ParentId = request.ParentId,
            IsFlagged = false
        };

        _context.Feedbacks.Add(reply);
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Notify recipient
        if (_userContext.Role == UserRole.Administrator)
        {
            // Admin replied -> Notify Student (parent.OwnerId)
            await _notificationService.SendNotificationAsync(
                parent.OwnerId,
                "New Administrative Reply",
                $"An administrator has replied to your thread '{parent.Title}'.",
                $"/feedback/{parent.Id}"
            );
        }
        else if (_userContext.UserId != parent.OwnerId)
        {
            // Someone else (maybe admin via different path or user-to-user if allowed) replied
            await _notificationService.SendNotificationAsync(
                parent.OwnerId,
                "New Reply",
                $"Someone has replied to your thread '{parent.Title}'.",
                $"/feedback/{parent.Id}"
            );
        }

        return reply.Id;
    }
}
