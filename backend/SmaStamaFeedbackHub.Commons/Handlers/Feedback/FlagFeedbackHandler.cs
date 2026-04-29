using MediatR;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class FlagFeedbackCommand : FlagFeedbackRequest, IRequest<bool>;

public class FlagFeedbackHandler : IRequestHandler<FlagFeedbackCommand, bool>
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public FlagFeedbackHandler(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(FlagFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks.FindAsync(request.FeedbackId);
        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        feedback.IsFlagged = true;
        feedback.FlagReason = $"User Reported: {request.Reason}";

        await _context.SaveChangesAsync(cancellationToken);

        // Notify the owner
        await _notificationService.SendNotificationAsync(
            feedback.OwnerId,
            "Feedback Ditandai Untuk Pengecekan ⚠️",
            $"Feedback \'{feedback.Title}\' ditandai untuk pengecekan (flagged)",
            $"/feedback/{feedback.Id}"
        );

        return true;
    }
}
