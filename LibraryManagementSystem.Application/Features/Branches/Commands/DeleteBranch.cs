using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Branches.Commands;

public record DeleteBranchCommand(Guid Id) : IRequest<bool>;

public class DeleteBranchCommandHandler : IRequestHandler<DeleteBranchCommand, bool>
{
    private readonly IRepository<Branch> _repository;

    public DeleteBranchCommandHandler(IRepository<Branch> repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(DeleteBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await _repository.GetByIdAsync(request.Id);
        if (branch == null) return false;

        await _repository.DeleteAsync(branch);
        await _repository.SaveChangesAsync();

        return true;
    }
}
