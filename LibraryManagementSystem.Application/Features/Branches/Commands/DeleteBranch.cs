using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Branches.Commands;

public record DeleteBranchCommand(Guid Id) : IRequest<bool>;

public class DeleteBranchCommandHandler : IRequestHandler<DeleteBranchCommand, bool>
{
    private readonly IRepository<Branch> _branchRepository;
    private readonly IRepository<Book> _bookRepository;
    private readonly IRepository<BorrowRecord> _borrowRepository;
    private readonly IRepository<Reservation> _reservationRepository;

    public DeleteBranchCommandHandler(
        IRepository<Branch> branchRepository,
        IRepository<Book> bookRepository,
        IRepository<BorrowRecord> borrowRepository,
        IRepository<Reservation> reservationRepository)
    {
        _branchRepository = branchRepository;
        _bookRepository = bookRepository;
        _borrowRepository = borrowRepository;
        _reservationRepository = reservationRepository;
    }

    public async Task<bool> Handle(DeleteBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await _branchRepository.GetByIdAsync(request.Id);
        if (branch == null) return false;

        var books = await _bookRepository.FindAsync(b => b.BranchId == request.Id);
        foreach (var book in books)
        {
            var borrows = await _borrowRepository.FindAsync(br => br.BookId == book.Id);
            foreach (var br in borrows)
            {
                await _borrowRepository.DeleteAsync(br);
            }

            var reservations = await _reservationRepository.FindAsync(r => r.BookId == book.Id);
            foreach (var r in reservations)
            {
                await _reservationRepository.DeleteAsync(r);
            }

            await _bookRepository.DeleteAsync(book);
        }

        await _branchRepository.DeleteAsync(branch);
        await _branchRepository.SaveChangesAsync();

        return true;
    }
}
