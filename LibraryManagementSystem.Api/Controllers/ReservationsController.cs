using LibraryManagementSystem.Application.Features.Reservations.Commands;
using LibraryManagementSystem.Application.Features.Reservations.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagementSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllReservationsQuery());
        return Ok(result);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUserId(Guid userId)
    {
        var result = await _mediator.Send(new GetUserReservationsQuery(userId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Reserve([FromBody] ReserveBookCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id, message = "Book reserved successfully." });
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var success = await _mediator.Send(new CancelReservationCommand(id));
        if (!success) return NotFound();
        return Ok(new { success, message = "Reservation cancelled successfully." });
    }
}
