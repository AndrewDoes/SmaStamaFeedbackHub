using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Responses.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFlaggedFeedbackQuery : IRequest<List<FeedbackDto>>;

public class GetFlaggedFeedbackHandler : IRequestHandler<GetFlaggedFeedbackQuery, List<FeedbackDto>>
{
    private readonly AppDbContext _context;

    public GetFlaggedFeedbackHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FeedbackDto>> Handle(GetFlaggedFeedbackQuery request, CancellationToken cancellationToken)
    {
        var flaggedItems = await _context.Feedbacks
            .Where(f => f.IsFlagged)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);

        return flaggedItems.Select(f => new FeedbackDto
        {
            Id = f.Id,
            Title = f.Title,
            Content = f.Content,
            CreatedAt = f.CreatedAt,
            IsFlagged = f.IsFlagged
        }).ToList();
    }
}
