using MediatR;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class ResolveFeedbackFlagCommand : ResolveFeedbackFlagRequest, IRequest<bool>;

public class ResolveFeedbackFlagHandler : IRequestHandler<ResolveFeedbackFlagCommand, bool>
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    public ResolveFeedbackFlagHandler(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(ResolveFeedbackFlagCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks.FindAsync(request.FeedbackId);
        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        feedback.IsFlagged = false;
        feedback.FlagReason = null;

        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendNotificationAsync(
            feedback.OwnerId,
            "Feedback Tidak Ditandai Lagi",
            $"Feedback \'{feedback.Title}\' sudah tidak ditandai (flagged) lagi oleh admin",
            $"/feedback/{feedback.Id}"
        );

        return true;
    }
}
