using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Requests.Users;
using SmaStamaFeedbackHub.Contracts.Responses.Common;
using SmaStamaFeedbackHub.Contracts.Responses.Users;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Users;

public class GetStudentListQuery : GetStudentListRequest, IRequest<PagedResult<StudentResponse>>;

public class GetStudentListHandler : IRequestHandler<GetStudentListQuery, PagedResult<StudentResponse>>
{
    private readonly AppDbContext _context;

    public GetStudentListHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<StudentResponse>> Handle(GetStudentListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Users
            .Where(u => u.Role == UserRole.Student)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(search) || u.Code.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(u => u.FullName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new StudentResponse
            {
                Id = u.Id,
                Code = u.Code,
                FullName = u.FullName,
                BatchYear = u.BatchYear,
                IsActive = u.IsActive,
                FeedbackCount = _context.Feedbacks.Count(f => f.OwnerId == u.Id && f.ParentId == null)
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<StudentResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}
