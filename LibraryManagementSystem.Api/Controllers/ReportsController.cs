using LibraryManagementSystem.Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetReports()
    {
        var reports = await _mediator.Send(new GetReportsQuery());
        return Ok(reports);
    }
}
