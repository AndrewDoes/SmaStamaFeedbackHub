using MediatR;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class ResolveFeedbackFlagCommand : ResolveFeedbackFlagRequest, IRequest<bool>;

public class ResolveFeedbackFlagHandler : IRequestHandler<ResolveFeedbackFlagCommand, bool>
{
    private readonly AppDbContext _context;

    public ResolveFeedbackFlagHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ResolveFeedbackFlagCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks.FindAsync(request.FeedbackId);
        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        feedback.IsFlagged = false;
        feedback.FlagReason = null;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
