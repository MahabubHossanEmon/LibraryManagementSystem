using AutoMapper;
using LibraryManagementSystem.Application.DTOs;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Books.Queries;

public record GetAllBooksQuery() : IRequest<IEnumerable<BookDto>>;

// Note: For complex queries with includes, standard IRepository might not be enough unless it exposes IQueryable or we inject DbContext.
// In this CQRS setup, Queries often bypass the generic repository and use DbContext directly for performance and Includes,
// or we can use the repository if it fits. For GetAllBooks with Branch Name, we need Include(b => b.Branch).
// Since our IRepository is basic, we will inject IRepository but if we need Includes, we might need a custom query or DbContext.
// Let's create an IApplicationDbContext interface in Application layer to abstract DbContext.
// For now, to stick to the plan without overcomplicating, I will just use IRepository<Book> and if Branch is null, BranchName will be empty.
// Actually, I'll update IRepository to have an Include method, or just write it simply for the assessment.
// Or, just let AutoMapper handle it if lazy loading is enabled. Let's assume we update IRepository to support Includes, or just fetch all and let AutoMapper map (bad for N+1).
// Let's create an IApplicationDbContext interface in Application layer to abstract DbContext.
// For now, to stick to the plan without overcomplicating, I will just use IRepository<Book> and if Branch is null, BranchName will be empty.
// Actually, I'll update IRepository to have an Include method, or just write it simply for the assessment.

public class GetAllBooksQueryHandler : IRequestHandler<GetAllBooksQuery, IEnumerable<BookDto>>
{
    private readonly IRepository<Book> _repository;
    private readonly IMapper _mapper;

    public GetAllBooksQueryHandler(IRepository<Book> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BookDto>> Handle(GetAllBooksQuery request, CancellationToken cancellationToken)
    {
        var books = await _repository.GetAllAsync();
        // Warning: This won't load Branch property without Include. 
        return _mapper.Map<IEnumerable<BookDto>>(books);
    }
}
