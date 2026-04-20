using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Responses.Feedback;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFeedbackDetailQuery : IRequest<FeedbackDto>
{
    public Guid Id { get; set; }
    public GetFeedbackDetailQuery(Guid id) => Id = id;
}

public class GetFeedbackDetailHandler : IRequestHandler<GetFeedbackDetailQuery, FeedbackDto>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetFeedbackDetailHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<FeedbackDto> Handle(GetFeedbackDetailQuery request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Replies)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        // Privacy Logic: Students can only see their own records
        if (_userContext.Role == UserRole.Student && feedback.OwnerId != _userContext.UserId)
        {
            throw new UnauthorizedAccessException("Access Denied: You can only view your own feedback threads.");
        }

        return MapToDto(feedback);
    }

    private static FeedbackDto MapToDto(Entities.Feedback feedback)
    {
        return new FeedbackDto
        {
            Id = feedback.Id,
            Title = feedback.Title,
            Content = feedback.Content,
            CreatedAt = feedback.CreatedAt,
            IsFlagged = feedback.IsFlagged,
            Status = feedback.Status,
            Replies = feedback.Replies.Select(MapToDto).ToList()
        };
    }
}
