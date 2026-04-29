using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmaStamaFeedbackHub.Commons.Handlers.Notifications;

public record MarkAsReadCommand(Guid Id) : IRequest;

public class MarkAsReadHandler : IRequestHandler<MarkAsReadCommand>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public MarkAsReadHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.UserId == _userContext.UserId, cancellationToken);

        if (notification == null) return;

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
