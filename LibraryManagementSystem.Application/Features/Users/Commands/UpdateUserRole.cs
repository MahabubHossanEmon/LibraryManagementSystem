using FluentValidation;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Users.Commands;

public record UpdateUserRoleCommand(Guid UserId, Role NewRole) : IRequest<bool>;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand>
{
    public UpdateUserRoleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, bool>
{
    private readonly IRepository<User> _userRepo;

    public UpdateUserRoleCommandHandler(IRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<bool> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null) return false;

        user.Role = request.NewRole;
        await _userRepo.UpdateAsync(user);
        await _userRepo.SaveChangesAsync();

        return true;
    }
}
