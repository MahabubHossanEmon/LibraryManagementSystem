using AutoMapper;
using LibraryManagementSystem.Application.DTOs;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Application.Features.Borrows.Queries;

public record GetAllBorrowsQuery() : IRequest<IEnumerable<BorrowRecordDto>>;

public class GetAllBorrowsQueryHandler : IRequestHandler<GetAllBorrowsQuery, IEnumerable<BorrowRecordDto>>
{
    private readonly IRepository<BorrowRecord> _repository;
    private readonly IMapper _mapper;

    public GetAllBorrowsQueryHandler(IRepository<BorrowRecord> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BorrowRecordDto>> Handle(GetAllBorrowsQuery request, CancellationToken cancellationToken)
    {
        var records = await _repository.GetQueryable()
            .Include(r => r.Book)
            .Include(r => r.User)
            .OrderByDescending(r => r.BorrowDate)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<BorrowRecordDto>>(records);
    }
}
