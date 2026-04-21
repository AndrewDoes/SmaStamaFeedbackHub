using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Responses.Feedback;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Entities;
using SmaStamaFeedbackHub.Contracts.Responses.Common;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFeedbackListQuery : IRequest<PagedResult<FeedbackDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public FeedbackStatus? Status { get; set; }
}

public class GetFeedbackListHandler : IRequestHandler<GetFeedbackListQuery, PagedResult<FeedbackDto>>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetFeedbackListHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<PagedResult<FeedbackDto>> Handle(GetFeedbackListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Feedbacks
            .Where(f => f.ParentId == null) // Only show root threads in list view
            .AsQueryable();

        // 1. Search Filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(f => f.Title.ToLower().Contains(search) || f.Content.ToLower().Contains(search));
        }

        // 2. Privacy Logic: Students only see their own threads
        if (_userContext.Role == UserRole.Student)
        {
            query = query.Where(f => f.OwnerId == _userContext.UserId);
        }

        // 3. Status Filter
        if (request.Status.HasValue)
        {
            query = query.Where(f => f.Status == request.Status.Value);
        }

        // 3. Count Total before paging
        var totalCount = await query.CountAsync(cancellationToken);

        // 4. Apply Role-Based Sorting & Pagination
        // Admins get FIFO (Oldest First) for queue clearing.
        // Students get LIFO (Newest First) for recent updates.
        var orderedQuery = _userContext.Role == UserRole.Administrator
            ? query.OrderBy(f => f.CreatedAt)
            : query.OrderByDescending(f => f.CreatedAt);

        var items = await orderedQuery
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FeedbackDto
            {
                Id = f.Id,
                Title = f.Title,
                Content = f.Content,
                CreatedAt = f.CreatedAt,
                IsFlagged = f.IsFlagged,
                Status = f.Status,
                Category = f.Category
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<FeedbackDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}
