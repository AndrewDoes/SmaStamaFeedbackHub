using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Feedback.Responses;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFeedbackListQuery : IRequest<List<FeedbackDto>>;

public class GetFeedbackListHandler : IRequestHandler<GetFeedbackListQuery, List<FeedbackDto>>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetFeedbackListHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<List<FeedbackDto>> Handle(GetFeedbackListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Feedbacks
            .Where(f => f.ParentId == null) // Only show root threads in list view
            .AsQueryable();

        // Privacy Logic: Students only see their own threads
        if (_userContext.Role == UserRole.Student)
        {
            query = query.Where(f => f.OwnerId == _userContext.UserId);
        }

        return await query
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FeedbackDto
            {
                Id = f.Id,
                Title = f.Title,
                Content = f.Content,
                CreatedAt = f.CreatedAt,
                IsFlagged = f.IsFlagged
            })
            .ToListAsync(cancellationToken);
    }
}
