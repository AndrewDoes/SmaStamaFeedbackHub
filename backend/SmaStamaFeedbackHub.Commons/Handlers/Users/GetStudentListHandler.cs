using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;
using SmaStamaFeedbackHub.Contracts.Responses.Common;

namespace SmaStamaFeedbackHub.Commons.Handlers.Users;

public class StudentDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string FullName { get; set; }
    public int? BatchYear { get; set; }
    public bool IsActive { get; set; }
    public int FeedbackCount { get; set; }
}

public class GetStudentListQuery : IRequest<PagedResult<StudentDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
}

public class GetStudentListHandler : IRequestHandler<GetStudentListQuery, PagedResult<StudentDto>>
{
    private readonly AppDbContext _context;

    public GetStudentListHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<StudentDto>> Handle(GetStudentListQuery request, CancellationToken cancellationToken)
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
            .Select(u => new StudentDto
            {
                Id = u.Id,
                Code = u.Code,
                FullName = u.FullName,
                BatchYear = u.BatchYear,
                IsActive = u.IsActive,
                FeedbackCount = _context.Feedbacks.Count(f => f.OwnerId == u.Id && f.ParentId == null)
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<StudentDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}
