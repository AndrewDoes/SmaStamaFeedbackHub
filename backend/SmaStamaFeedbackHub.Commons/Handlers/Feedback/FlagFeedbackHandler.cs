using MediatR;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class FlagFeedbackCommand : FlagFeedbackRequest, IRequest<bool>;

public class FlagFeedbackHandler : IRequestHandler<FlagFeedbackCommand, bool>
{
    private readonly AppDbContext _context;

    public FlagFeedbackHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(FlagFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks.FindAsync(request.FeedbackId);
        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        feedback.IsFlagged = true;
        feedback.FlagReason = $"User Reported: {request.Reason}";

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
