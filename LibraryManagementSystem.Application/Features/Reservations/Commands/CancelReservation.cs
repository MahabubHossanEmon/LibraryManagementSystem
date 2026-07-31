using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Reservations.Commands;

public record CancelReservationCommand(Guid Id) : IRequest<bool>;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand, bool>
{
    private readonly IRepository<Reservation> _reservationRepo;

    public CancelReservationCommandHandler(IRepository<Reservation> reservationRepo)
    {
        _reservationRepo = reservationRepo;
    }

    public async Task<bool> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepo.GetByIdAsync(request.Id);
        if (reservation == null) return false;

        reservation.Status = ReservationStatus.Cancelled;
        await _reservationRepo.UpdateAsync(reservation);
        await _reservationRepo.SaveChangesAsync();

        return true;
    }
}
