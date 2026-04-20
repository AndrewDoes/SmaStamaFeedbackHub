using MediatR;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class UpdateFeedbackStatusCommand : IRequest
{
    public Guid Id { get; set; }
    public FeedbackStatus Status { get; set; }
}

public class UpdateFeedbackStatusHandler : IRequestHandler<UpdateFeedbackStatusCommand>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public UpdateFeedbackStatusHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task Handle(UpdateFeedbackStatusCommand request, CancellationToken cancellationToken)
    {
        // 1. Strict Authorization: Only Administrators can change status
        if (_userContext.Role != UserRole.Administrator)
        {
            throw new UnauthorizedAccessException("Access Denied: Only administrators can update feedback status.");
        }

        var feedback = await _context.Feedbacks.FindAsync(new object[] { request.Id }, cancellationToken);
        if (feedback == null)
        {
            throw new KeyNotFoundException("Feedback record not found.");
        }

        // 2. Apply status change
        feedback.Status = request.Status;
        
        await _context.SaveChangesAsync(cancellationToken);
    }
}
