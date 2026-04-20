using MediatR;
using SmaStamaFeedbackHub.Commons.Behaviors;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class SubmitReplyCommand : ReplyToFeedbackRequest, IRequest<Guid>, ISafeRequest
{
    public string Title => ""; // Replies don't have titles
}

public class SubmitReplyHandler : IRequestHandler<SubmitReplyCommand, Guid>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public SubmitReplyHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<Guid> Handle(SubmitReplyCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if parent exists
        var parent = await _context.Feedbacks.FindAsync(request.ParentId);
        if (parent == null) throw new KeyNotFoundException("The feedback you are replying to does not exist.");

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

        return reply.Id;
    }
}
