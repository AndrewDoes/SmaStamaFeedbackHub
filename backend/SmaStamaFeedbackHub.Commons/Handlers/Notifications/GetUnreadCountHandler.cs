using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Entities;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace SmaStamaFeedbackHub.Commons.Handlers.Notifications;

public record GetUnreadCountQuery : IRequest<int>;

public class GetUnreadCountHandler : IRequestHandler<GetUnreadCountQuery, int>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetUnreadCountHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<int> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == _userContext.UserId && !n.IsRead, cancellationToken);
    }
}
