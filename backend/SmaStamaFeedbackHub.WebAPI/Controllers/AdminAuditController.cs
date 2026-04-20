using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaStamaFeedbackHub.Commons.Handlers.Feedback;

namespace SmaStamaFeedbackHub.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class AdminAuditController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminAuditController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("RevealIdentity/{id}")]
    public async Task<IActionResult> RevealIdentity(Guid id)
    {
        try
        {
            var auditData = await _mediator.Send(new GetFeedbackAuditQuery(id));
            return Ok(auditData);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
    }
}
