using LibraryManagementSystem.Application.Features.Branches.Commands;
using LibraryManagementSystem.Application.Features.Branches.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly IMediator _mediator;

    public BranchesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var branches = await _mediator.Send(new GetAllBranchesQuery());
        return Ok(branches);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var branch = await _mediator.Send(new GetBranchByIdQuery(id));
        if (branch == null) return NotFound();
        return Ok(branch);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBranchCommand command)
    {
        var branchId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = branchId }, branchId);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBranchCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch");
        var success = await _mediator.Send(command);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteBranchCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }
}
