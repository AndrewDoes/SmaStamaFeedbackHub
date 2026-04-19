using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Responses.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFeedbackDetailQuery : IRequest<AdminFeedbackDto>
{
    public Guid Id { get; set; }
    public GetFeedbackDetailQuery(Guid id) => Id = id;
}

public class GetFeedbackDetailHandler : IRequestHandler<GetFeedbackDetailQuery, AdminFeedbackDto>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetFeedbackDetailHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<AdminFeedbackDto> Handle(GetFeedbackDetailQuery request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Owner)
            .Include(f => f.Replies)
                .ThenInclude(r => r.Owner)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        // Privacy Logic: Students can only see their own records
        if (_userContext.Role == UserRole.Student && feedback.OwnerId != _userContext.UserId)
        {
            throw new UnauthorizedAccessException("You do not have permission to view this feedback.");
        }

        return MapToAdminDto(feedback);
    }

    private static AdminFeedbackDto MapToAdminDto(Entities.Feedback feedback)
    {
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
            OwnerFullName = feedback.Owner.FullName,
            Replies = feedback.Replies.Select(MapToAdminDto).ToList()
        };
    }
}
