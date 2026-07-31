using AutoMapper;
using LibraryManagementSystem.Application.DTOs;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Branches.Queries;

public record GetAllBranchesQuery() : IRequest<IEnumerable<BranchDto>>;

public class GetAllBranchesQueryHandler : IRequestHandler<GetAllBranchesQuery, IEnumerable<BranchDto>>
{
    private readonly IRepository<Branch> _repository;
    private readonly IMapper _mapper;

    public GetAllBranchesQueryHandler(IRepository<Branch> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BranchDto>> Handle(GetAllBranchesQuery request, CancellationToken cancellationToken)
    {
        var branches = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<BranchDto>>(branches);
    }
}
