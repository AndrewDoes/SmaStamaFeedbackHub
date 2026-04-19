using MediatR;
using SmaStamaFeedbackHub.Commons;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class SubmitReplyCommand : ReplyToFeedbackRequest, IRequest<Guid>;

public class SubmitReplyHandler : IRequestHandler<SubmitReplyCommand, Guid>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly ISafetyFilter _safetyFilter;

    public SubmitReplyHandler(AppDbContext context, IUserContext userContext, ISafetyFilter safetyFilter)
    {
        _context = context;
        _userContext = userContext;
        _safetyFilter = safetyFilter;
    }

    public async Task<Guid> Handle(SubmitReplyCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if parent exists
        var parent = await _context.Feedbacks.FindAsync(request.ParentId);
        if (parent == null) throw new KeyNotFoundException("The feedback you are replying to does not exist.");

        // 2. Safety filtering
        var isSafe = await _safetyFilter.IsContentSafeAsync(request.Content);
        if (!isSafe)
        {
            throw new FluentValidation.ValidationException("Inappropriate content detected. Reply blocked.");
        }

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

        return reply.Id;
    }
}
