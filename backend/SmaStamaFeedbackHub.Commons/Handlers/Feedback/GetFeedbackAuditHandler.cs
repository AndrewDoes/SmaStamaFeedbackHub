using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Responses.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFeedbackAuditQuery : IRequest<AdminFeedbackDto>
{
    public Guid FeedbackId { get; set; }
    public GetFeedbackAuditQuery(Guid id) => FeedbackId = id;
}

public class GetFeedbackAuditHandler : IRequestHandler<GetFeedbackAuditQuery, AdminFeedbackDto>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetFeedbackAuditHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<AdminFeedbackDto> Handle(GetFeedbackAuditQuery request, CancellationToken cancellationToken)
    {
        // 1. Double check role (though controller should handle this)
        if (_userContext.Role != UserRole.Administrator)
        {
            throw new UnauthorizedAccessException("Only Administrators can perform audits.");
        }

        // 2. Fetch feedback with identity details
        var feedback = await _context.Feedbacks
            .Include(f => f.Owner)
            .FirstOrDefaultAsync(f => f.Id == request.FeedbackId, cancellationToken);

        if (feedback == null) throw new KeyNotFoundException("Feedback record not found.");

        // 3. Strict V7 Rule: Reveal identities ONLY for flagged content
        if (!feedback.IsFlagged)
        {
            throw new InvalidOperationException("Identity details can only be revealed for flagged content.");
        }

        return new AdminFeedbackDto
        {
            Id = feedback.Id,
            Title = feedback.Title,
            Content = feedback.Content,
            CreatedAt = feedback.CreatedAt,
            IsFlagged = feedback.IsFlagged,
            FlagReason = feedback.FlagReason,
            OwnerId = feedback.OwnerId,
            OwnerCode = feedback.Owner.Code,
            OwnerFullName = feedback.Owner.FullName
        };
    }
}
