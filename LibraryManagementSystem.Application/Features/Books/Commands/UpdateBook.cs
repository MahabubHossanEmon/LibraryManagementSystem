using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Books.Commands;

public record UpdateBookCommand(
    Guid Id,
    string Title, 
    string Author, 
    string ISBN, 
    string Publisher, 
    int YearPublished, 
    int TotalCopies, 
    Guid BranchId) : IRequest<bool>;

public class UpdateBookCommandValidator : AbstractValidator<UpdateBookCommand>
{
    public UpdateBookCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Author).NotEmpty().MaximumLength(150);
        RuleFor(x => x.ISBN).NotEmpty().MaximumLength(20);
        RuleFor(x => x.BranchId).NotEmpty();
        RuleFor(x => x.TotalCopies).GreaterThanOrEqualTo(0);
    }
}

public class UpdateBookCommandHandler : IRequestHandler<UpdateBookCommand, bool>
{
    private readonly IRepository<Book> _repository;

    public UpdateBookCommandHandler(IRepository<Book> repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(UpdateBookCommand request, CancellationToken cancellationToken)
    {
        var book = await _repository.GetByIdAsync(request.Id);
        if (book == null) return false;

        var borrowedCount = book.TotalCopies - book.AvailableCopies;

        book.Title = request.Title;
        book.Author = request.Author;
        book.ISBN = request.ISBN;
        book.Publisher = request.Publisher;
        book.YearPublished = request.YearPublished;
        book.TotalCopies = request.TotalCopies;
        book.AvailableCopies = Math.Max(0, request.TotalCopies - borrowedCount);
        book.BranchId = request.BranchId;

        await _repository.UpdateAsync(book);
        await _repository.SaveChangesAsync();
        
        return true;
    }
}
