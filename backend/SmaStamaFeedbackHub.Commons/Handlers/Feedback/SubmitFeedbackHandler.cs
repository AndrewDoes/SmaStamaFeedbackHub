using MediatR;
using SmaStamaFeedbackHub.Commons;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class SubmitFeedbackCommand : CreateFeedbackRequest, IRequest<Guid>;

public class SubmitFeedbackHandler : IRequestHandler<SubmitFeedbackCommand, Guid>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly ISafetyFilter _safetyFilter;

    public SubmitFeedbackHandler(AppDbContext context, IUserContext userContext, ISafetyFilter safetyFilter)
    {
        _context = context;
        _userContext = userContext;
        _safetyFilter = safetyFilter;
    }

    public async Task<Guid> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var isSafe = await _safetyFilter.IsContentSafeAsync(request.Title + " " + request.Content);

        var feedback = new Entities.Feedback
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            OwnerId = _userContext.UserId,
            IsFlagged = !isSafe,
            FlagReason = isSafe ? null : "Automated: Forbidden words detected"
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        return feedback.Id;
    }
}
