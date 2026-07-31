using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Reservations.Commands;

public record FulfillReservationCommand(Guid Id) : IRequest<bool>;

public class FulfillReservationCommandHandler : IRequestHandler<FulfillReservationCommand, bool>
{
    private readonly IRepository<Reservation> _reservationRepo;
    private readonly IRepository<Book> _bookRepo;
    private readonly IRepository<BorrowRecord> _borrowRepo;

    public FulfillReservationCommandHandler(
        IRepository<Reservation> reservationRepo,
        IRepository<Book> bookRepo,
        IRepository<BorrowRecord> borrowRepo)
    {
        _reservationRepo = reservationRepo;
        _bookRepo = bookRepo;
        _borrowRepo = borrowRepo;
    }

    public async Task<bool> Handle(FulfillReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepo.GetByIdAsync(request.Id);
        if (reservation == null) return false;

        reservation.Status = ReservationStatus.Fulfilled;
        await _reservationRepo.UpdateAsync(reservation);

        // Optionally decrease book copy and create an active borrow record if available
        var book = await _bookRepo.GetByIdAsync(reservation.BookId);
        if (book != null && book.AvailableCopies > 0)
        {
            book.AvailableCopies -= 1;
            await _bookRepo.UpdateAsync(book);

            var borrowRecord = new BorrowRecord
            {
                BookId = reservation.BookId,
                UserId = reservation.UserId,
                BorrowDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(14),
                Status = BorrowStatus.Borrowed
            };
            await _borrowRepo.AddAsync(borrowRecord);
        }

        await _reservationRepo.SaveChangesAsync();
        return true;
    }
}
