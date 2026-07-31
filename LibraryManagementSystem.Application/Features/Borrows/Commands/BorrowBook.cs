using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Borrows.Commands;

public record BorrowBookCommand(Guid BookId, Guid UserId, int DaysToBorrow = 14) : IRequest<Guid>;

public class BorrowBookCommandValidator : AbstractValidator<BorrowBookCommand>
{
    public BorrowBookCommandValidator()
    {
        RuleFor(x => x.BookId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DaysToBorrow).GreaterThan(0).LessThanOrEqualTo(60);
    }
}

public class BorrowBookCommandHandler : IRequestHandler<BorrowBookCommand, Guid>
{
    private readonly IRepository<Book> _bookRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<BorrowRecord> _borrowRepository;

    public BorrowBookCommandHandler(
        IRepository<Book> bookRepository,
        IRepository<User> userRepository,
        IRepository<BorrowRecord> borrowRepository)
    {
        _bookRepository = bookRepository;
        _userRepository = userRepository;
        _borrowRepository = borrowRepository;
    }

    public async Task<Guid> Handle(BorrowBookCommand request, CancellationToken cancellationToken)
    {
        var book = await _bookRepository.GetByIdAsync(request.BookId);
        if (book == null)
        {
            throw new KeyNotFoundException($"Book with ID '{request.BookId}' not found.");
        }

        if (book.AvailableCopies <= 0)
        {
            throw new InvalidOperationException($"Book '{book.Title}' is currently out of available copies.");
        }

        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{request.UserId}' not found.");
        }

        book.AvailableCopies -= 1;
        await _bookRepository.UpdateAsync(book);

        var borrowRecord = new BorrowRecord
        {
            BookId = request.BookId,
            UserId = request.UserId,
            BorrowDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(request.DaysToBorrow),
            Status = BorrowStatus.Borrowed
        };

        await _borrowRepository.AddAsync(borrowRecord);
        await _borrowRepository.SaveChangesAsync();

        return borrowRecord.Id;
    }
}
