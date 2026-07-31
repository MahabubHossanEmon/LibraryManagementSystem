using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Branches.Commands;

public record CreateBranchCommand(string Name, string Address, string ContactNumber) : IRequest<Guid>;

public class CreateBranchCommandValidator : AbstractValidator<CreateBranchCommand>
{
    public CreateBranchCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactNumber).NotEmpty().MaximumLength(20);
    }
}

public class CreateBranchCommandHandler : IRequestHandler<CreateBranchCommand, Guid>
{
    private readonly IRepository<Branch> _repository;

    public CreateBranchCommandHandler(IRepository<Branch> repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = new Branch
        {
            Name = request.Name,
            Address = request.Address,
            ContactNumber = request.ContactNumber
        };

        await _repository.AddAsync(branch);
        await _repository.SaveChangesAsync();
        
        return branch.Id;
    }
}
