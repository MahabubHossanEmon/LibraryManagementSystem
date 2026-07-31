using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Books.Commands;

public record CreateBookCommand(
    string Title, 
    string Author, 
    string ISBN, 
    string Publisher, 
    int YearPublished, 
    int TotalCopies, 
    Guid BranchId) : IRequest<Guid>;

public class CreateBookCommandValidator : AbstractValidator<CreateBookCommand>
{
    public CreateBookCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Author).NotEmpty().MaximumLength(150);
        RuleFor(x => x.ISBN).NotEmpty().MaximumLength(20);
        RuleFor(x => x.BranchId).NotEmpty();
        RuleFor(x => x.TotalCopies).GreaterThan(0);
    }
}

public class CreateBookCommandHandler : IRequestHandler<CreateBookCommand, Guid>
{
    private readonly IRepository<Book> _repository;

    public CreateBookCommandHandler(IRepository<Book> repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateBookCommand request, CancellationToken cancellationToken)
    {
        var book = new Book
        {
            Title = request.Title,
            Author = request.Author,
            ISBN = request.ISBN,
            Publisher = request.Publisher,
            YearPublished = request.YearPublished,
            TotalCopies = request.TotalCopies,
            AvailableCopies = request.TotalCopies, // Initially all copies are available
            BranchId = request.BranchId
        };

        await _repository.AddAsync(book);
        await _repository.SaveChangesAsync();
        
        return book.Id;
    }
}
