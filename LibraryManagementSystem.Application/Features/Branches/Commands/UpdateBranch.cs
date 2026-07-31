using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Branches.Commands;

public record UpdateBranchCommand(Guid Id, string Name, string Address, string ContactNumber) : IRequest<bool>;

public class UpdateBranchCommandValidator : AbstractValidator<UpdateBranchCommand>
{
    public UpdateBranchCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(300);
        RuleFor(x => x.ContactNumber).NotEmpty().MaximumLength(20);
    }
}

public class UpdateBranchCommandHandler : IRequestHandler<UpdateBranchCommand, bool>
{
    private readonly IRepository<Branch> _repository;

    public UpdateBranchCommandHandler(IRepository<Branch> repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(UpdateBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await _repository.GetByIdAsync(request.Id);
        if (branch == null) return false;

        branch.Name = request.Name;
        branch.Address = request.Address;
        branch.ContactNumber = request.ContactNumber;

        await _repository.UpdateAsync(branch);
        await _repository.SaveChangesAsync();

        return true;
    }
}
