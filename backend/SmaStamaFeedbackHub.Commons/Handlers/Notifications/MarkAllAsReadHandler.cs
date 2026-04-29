using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SmaStamaFeedbackHub.Commons.Handlers.Notifications;

public record MarkAllAsReadCommand : IRequest;

public class MarkAllAsReadHandler : IRequestHandler<MarkAllAsReadCommand>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public MarkAllAsReadHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task Handle(MarkAllAsReadCommand request, CancellationToken cancellationToken)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == _userContext.UserId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var n in notifications)
        {
            n.IsRead = true;
        }
        
        await _context.SaveChangesAsync(cancellationToken);
    }
}
