using MediatR;
using SmaStamaFeedbackHub.Entities;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Contracts.Enums;
using Microsoft.EntityFrameworkCore;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class DeleteFeedbackCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public DeleteFeedbackCommand(Guid id) => Id = id;
}

public class DeleteFeedbackHandler : IRequestHandler<DeleteFeedbackCommand, bool>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly IStorageService _storageService;

    public DeleteFeedbackHandler(AppDbContext context, IUserContext userContext, IStorageService storageService)
    {
        _context = context;
        _userContext = userContext;
        _storageService = storageService;
    }

    public async Task<bool> Handle(DeleteFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Attachments)
            .Include(f => f.Replies)
            .Include(f => f.Logs)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        // 1. Authorization & Workflow Check
        if (_userContext.Role != UserRole.Administrator)
        {
            // If not admin, must be the owner
            if (feedback.OwnerId != _userContext.UserId)
                throw new UnauthorizedAccessException("You can only delete your own feedback.");

            // Must be Open status
            if (feedback.Status != FeedbackStatus.Open)
                throw new InvalidOperationException("You cannot delete feedback that is already in progress or resolved.");
        }

        // 2. Storage Cleanup
        foreach (var att in feedback.Attachments)
        {
            await _storageService.DeleteFileAsync(att.BlobUrl);
        }

        // 3. Notification Cleanup
        var feedbackIdStr = feedback.Id.ToString();
        var notifications = await _context.Notifications
            .Where(n => n.Link != null && n.Link.Contains(feedbackIdStr))
            .ToListAsync(cancellationToken);
        _context.Notifications.RemoveRange(notifications);

        // 4. Cleanup Children & Logs
        _context.Feedbacks.RemoveRange(feedback.Replies);
        _context.FeedbackLogs.RemoveRange(feedback.Logs);
        _context.Attachments.RemoveRange(feedback.Attachments);

        // 5. Final Deletion
        _context.Feedbacks.Remove(feedback);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
