using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaStamaFeedbackHub.Commons.Handlers.Notifications;
using System;
using System.Threading.Tasks;

namespace SmaStamaFeedbackHub.WebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var result = await _mediator.Send(new GetNotificationsQuery());
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _mediator.Send(new GetUnreadCountQuery());
        return Ok(new { count });
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _mediator.Send(new MarkAsReadCommand(id));
        return Ok();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _mediator.Send(new MarkAllAsReadCommand());
        return Ok();
    }
}
