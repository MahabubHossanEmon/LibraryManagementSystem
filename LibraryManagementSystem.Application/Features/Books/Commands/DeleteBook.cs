using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Books.Commands;

public record DeleteBookCommand(Guid Id) : IRequest<bool>;

public class DeleteBookCommandHandler : IRequestHandler<DeleteBookCommand, bool>
{
    private readonly IRepository<Book> _bookRepository;
    private readonly IRepository<BorrowRecord> _borrowRepository;
    private readonly IRepository<Reservation> _reservationRepository;

    public DeleteBookCommandHandler(
        IRepository<Book> bookRepository,
        IRepository<BorrowRecord> borrowRepository,
        IRepository<Reservation> reservationRepository)
    {
        _bookRepository = bookRepository;
        _borrowRepository = borrowRepository;
        _reservationRepository = reservationRepository;
    }

    public async Task<bool> Handle(DeleteBookCommand request, CancellationToken cancellationToken)
    {
        var book = await _bookRepository.GetByIdAsync(request.Id);
        if (book == null) return false;

        // Clean up related borrows and reservations to prevent FK constraint errors
        var borrows = await _borrowRepository.FindAsync(b => b.BookId == request.Id);
        foreach (var b in borrows)
        {
            await _borrowRepository.DeleteAsync(b);
        }

        var reservations = await _reservationRepository.FindAsync(r => r.BookId == request.Id);
        foreach (var r in reservations)
        {
            await _reservationRepository.DeleteAsync(r);
        }

        await _bookRepository.DeleteAsync(book);
        await _bookRepository.SaveChangesAsync();
        
        return true;
    }
}
