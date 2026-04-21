using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaStamaFeedbackHub.Commons.Handlers.Feedback;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;

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
    public async Task<IActionResult> GetList([FromQuery] GetFeedbackListQuery query)
    {
        return Ok(await _mediator.Send(query));
    }

    [HttpGet("GetFeedbackDetail")]
    public async Task<IActionResult> GetDetail([FromQuery] Guid id)
    {
        return Ok(await _mediator.Send(new GetFeedbackDetailQuery(id)));
    }

    [Authorize]
    [HttpPost("SubmitFeedback")]
    public async Task<IActionResult> Submit([FromForm] CreateFeedbackRequest request, [FromForm] List<IFormFile>? proofs)
    {
        var command = new SubmitFeedbackCommand
        {
            Title = request.Title,
            Content = request.Content,
            Proofs = proofs
        };

        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }

    [Authorize]
    [HttpPost("SubmitReply")]
    public async Task<IActionResult> Reply([FromBody] ReplyToFeedbackRequest request)
    {
        var command = new SubmitReplyCommand
        {
            ParentId = request.ParentId,
            Content = request.Content
        };

        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }

    [Authorize]
    [HttpPost("FlagFeedback")]
    public async Task<IActionResult> Flag([FromBody] FlagFeedbackRequest request)
    {
        var command = new FlagFeedbackCommand
        {
            FeedbackId = request.FeedbackId,
            Reason = request.Reason
        };

        await _mediator.Send(command);
        return Ok(new { Success = true });
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("GetFlaggedList")]
    public async Task<IActionResult> GetFlaggedList()
    {
        return Ok(await _mediator.Send(new GetFlaggedFeedbackQuery()));
    }

    [Authorize(Roles = "Administrator")]
    [HttpPost("ResolveFlag")]
    public async Task<IActionResult> Resolve([FromBody] ResolveFeedbackFlagRequest request)
    {
        var command = new ResolveFeedbackFlagCommand
        {
            FeedbackId = request.FeedbackId
        };

        await _mediator.Send(command);
        return Ok(new { Success = true });
    }

    [Authorize(Roles = "Administrator")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteFeedbackCommand(id));
        return Ok(new { Success = true });
    }

    [HttpPatch("UpdateStatus")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateFeedbackStatusCommand command)
    {
        try
        {
            await _mediator.Send(command);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
