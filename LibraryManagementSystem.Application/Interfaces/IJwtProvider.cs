using LibraryManagementSystem.Domain.Entities;

namespace LibraryManagementSystem.Application.Interfaces;

public interface IJwtProvider
{
    string GenerateToken(User user);
}
