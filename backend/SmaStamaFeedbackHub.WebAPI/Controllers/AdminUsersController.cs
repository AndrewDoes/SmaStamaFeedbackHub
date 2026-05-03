using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaStamaFeedbackHub.Commons.Handlers.Users;

namespace SmaStamaFeedbackHub.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")] // Lockdown to staff only
public class AdminUsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminUsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("GetStudentList")]
    public async Task<IActionResult> GetStudentList([FromQuery] GetStudentListQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("ImportStudents")]
    public async Task<IActionResult> ImportStudents([FromForm] BulkImportStudentsCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("CreateStudent")]
    public async Task<IActionResult> CreateStudent([FromBody] CreateStudentCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("DeleteStudent/{id}")]
    public async Task<IActionResult> DeleteStudent(Guid id)
    {
        await _mediator.Send(new DeleteStudentCommand { Id = id });
        return NoContent();
    }
}
