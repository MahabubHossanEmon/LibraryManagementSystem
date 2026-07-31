using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Application.Features.Reservations.Commands;

public record ReserveBookCommand(Guid BookId, Guid UserId) : IRequest<Guid>;

public class ReserveBookCommandValidator : AbstractValidator<ReserveBookCommand>
{
    public ReserveBookCommandValidator()
    {
        RuleFor(x => x.BookId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public class ReserveBookCommandHandler : IRequestHandler<ReserveBookCommand, Guid>
{
    private readonly IRepository<Reservation> _reservationRepo;
    private readonly IRepository<Book> _bookRepo;
    private readonly IRepository<User> _userRepo;

    public ReserveBookCommandHandler(
        IRepository<Reservation> reservationRepo,
        IRepository<Book> bookRepo,
        IRepository<User> userRepo)
    {
        _reservationRepo = reservationRepo;
        _bookRepo = bookRepo;
        _userRepo = userRepo;
    }

    public async Task<Guid> Handle(ReserveBookCommand request, CancellationToken cancellationToken)
    {
        var book = await _bookRepo.GetByIdAsync(request.BookId);
        if (book == null)
            throw new KeyNotFoundException("Book not found.");

        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        var existingPending = await _reservationRepo.GetQueryable()
            .FirstOrDefaultAsync(r => r.BookId == request.BookId && r.UserId == request.UserId && r.Status == ReservationStatus.Pending, cancellationToken);

        if (existingPending != null)
            throw new InvalidOperationException("You already have an active reservation for this book.");

        var reservation = new Reservation
        {
            BookId = request.BookId,
            UserId = request.UserId,
            ReservationDate = DateTime.UtcNow,
            Status = ReservationStatus.Pending
        };

        await _reservationRepo.AddAsync(reservation);
        await _reservationRepo.SaveChangesAsync();

        return reservation.Id;
    }
}
