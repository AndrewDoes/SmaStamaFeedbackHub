using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmaStamaFeedbackHub.Commons.Handlers.Feedback;

namespace SmaStamaFeedbackHub.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly IMediator _mediator;

    public FeedbackController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("GetFeedbackList")]
    public async Task<IActionResult> GetList()
    {
        return Ok(await _mediator.Send(new GetFeedbackListQuery()));
    }

    [HttpGet("GetFeedbackDetail")]
    public async Task<IActionResult> GetDetail([FromQuery] Guid id)
    {
        return Ok(await _mediator.Send(new GetFeedbackDetailQuery(id)));
    }
}
