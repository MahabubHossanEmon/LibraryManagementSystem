using AutoMapper;
using LibraryManagementSystem.Application.DTOs;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Application.Features.Borrows.Queries;

public record GetUserBorrowsQuery(Guid UserId) : IRequest<IEnumerable<BorrowRecordDto>>;

public class GetUserBorrowsQueryHandler : IRequestHandler<GetUserBorrowsQuery, IEnumerable<BorrowRecordDto>>
{
    private readonly IRepository<BorrowRecord> _repository;
    private readonly IMapper _mapper;

    public GetUserBorrowsQueryHandler(IRepository<BorrowRecord> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BorrowRecordDto>> Handle(GetUserBorrowsQuery request, CancellationToken cancellationToken)
    {
        var records = await _repository.GetQueryable()
            .Where(r => r.UserId == request.UserId)
            .Include(r => r.Book)
            .Include(r => r.User)
            .OrderByDescending(r => r.BorrowDate)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<BorrowRecordDto>>(records);
    }
}
