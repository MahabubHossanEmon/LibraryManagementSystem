using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Borrows.Commands;

public record ReturnBookCommand(Guid BorrowRecordId) : IRequest<bool>;

public class ReturnBookCommandValidator : AbstractValidator<ReturnBookCommand>
{
    public ReturnBookCommandValidator()
    {
        RuleFor(x => x.BorrowRecordId).NotEmpty();
    }
}

public class ReturnBookCommandHandler : IRequestHandler<ReturnBookCommand, bool>
{
    private readonly IRepository<BorrowRecord> _borrowRepository;
    private readonly IRepository<Book> _bookRepository;

    public ReturnBookCommandHandler(
        IRepository<BorrowRecord> borrowRepository,
        IRepository<Book> bookRepository)
    {
        _borrowRepository = borrowRepository;
        _bookRepository = bookRepository;
    }

    public async Task<bool> Handle(ReturnBookCommand request, CancellationToken cancellationToken)
    {
        var record = await _borrowRepository.GetByIdAsync(request.BorrowRecordId);
        if (record == null)
        {
            throw new KeyNotFoundException($"Borrow record with ID '{request.BorrowRecordId}' not found.");
        }

        if (record.Status == BorrowStatus.Returned)
        {
            throw new InvalidOperationException("This book has already been returned.");
        }

        record.Status = BorrowStatus.Returned;
        record.ReturnDate = DateTime.UtcNow;

        await _borrowRepository.UpdateAsync(record);

        var book = await _bookRepository.GetByIdAsync(record.BookId);
        if (book != null)
        {
            book.AvailableCopies += 1;
            await _bookRepository.UpdateAsync(book);
        }

        await _borrowRepository.SaveChangesAsync();
        return true;
    }
}
