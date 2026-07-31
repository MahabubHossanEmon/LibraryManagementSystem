using LibraryManagementSystem.Application.Features.Borrows.Commands;
using LibraryManagementSystem.Application.Features.Borrows.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BorrowsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BorrowsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllBorrowsQuery());
        return Ok(result);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUserId(Guid userId)
    {
        var result = await _mediator.Send(new GetUserBorrowsQuery(userId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Borrow([FromBody] BorrowBookCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id, message = "Book borrowed successfully." });
    }

    [HttpPost("{id:guid}/return")]
    public async Task<IActionResult> Return(Guid id)
    {
        var success = await _mediator.Send(new ReturnBookCommand(id));
        return Ok(new { success, message = "Book returned successfully." });
    }
}
