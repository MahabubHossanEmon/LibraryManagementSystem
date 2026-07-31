using AutoMapper;
using LibraryManagementSystem.Application.DTOs;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Branches.Queries;

public record GetBranchByIdQuery(Guid Id) : IRequest<BranchDto?>;

public class GetBranchByIdQueryHandler : IRequestHandler<GetBranchByIdQuery, BranchDto?>
{
    private readonly IRepository<Branch> _repository;
    private readonly IMapper _mapper;

    public GetBranchByIdQueryHandler(IRepository<Branch> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<BranchDto?> Handle(GetBranchByIdQuery request, CancellationToken cancellationToken)
    {
        var branch = await _repository.GetByIdAsync(request.Id);
        if (branch == null) return null;

        return _mapper.Map<BranchDto>(branch);
    }
}
