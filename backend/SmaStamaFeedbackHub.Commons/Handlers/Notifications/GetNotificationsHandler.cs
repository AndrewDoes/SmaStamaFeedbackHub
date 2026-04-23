using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Contracts.Responses.Common;
using SmaStamaFeedbackHub.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmaStamaFeedbackHub.Commons.Handlers.Notifications;

public record GetNotificationsQuery : IRequest<List<NotificationDto>>;

public class GetNotificationsHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetNotificationsHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Notifications
            .Where(n => n.UserId == _userContext.UserId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Link = n.Link,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            })
            .ToListAsync(cancellationToken);
    }
}
