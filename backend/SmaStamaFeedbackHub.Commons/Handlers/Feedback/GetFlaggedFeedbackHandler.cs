using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Responses.Feedback;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFlaggedFeedbackQuery : IRequest<List<AdminFeedbackDto>>;

public class GetFlaggedFeedbackHandler : IRequestHandler<GetFlaggedFeedbackQuery, List<AdminFeedbackDto>>
{
    private readonly AppDbContext _context;

    public GetFlaggedFeedbackHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminFeedbackDto>> Handle(GetFlaggedFeedbackQuery request, CancellationToken cancellationToken)
    {
        var flaggedItems = await _context.Feedbacks
            .Include(f => f.Owner)
            .Where(f => f.IsFlagged)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);

        return flaggedItems.Select(f => new AdminFeedbackDto
        {
            Id = f.Id,
            Title = f.Title,
            Content = f.Content,
            CreatedAt = f.CreatedAt,
            IsFlagged = f.IsFlagged,
            FlagReason = f.FlagReason,
            OwnerId = f.OwnerId,
            OwnerCode = f.Owner.Code,
            OwnerFullName = f.Owner.FullName
        }).ToList();
    }
}
