using MediatR;
using SmaStamaFeedbackHub.Commons.Behaviors;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class SubmitFeedbackCommand : CreateFeedbackRequest, IRequest<Guid>, ISafeRequest;

public class SubmitFeedbackHandler : IRequestHandler<SubmitFeedbackCommand, Guid>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public SubmitFeedbackHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<Guid> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = new Entities.Feedback
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            OwnerId = _userContext.UserId,
            IsFlagged = false
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        return feedback.Id;
    }
}
