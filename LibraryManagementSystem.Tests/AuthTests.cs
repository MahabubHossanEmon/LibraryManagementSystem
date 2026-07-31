using LibraryManagementSystem.Application.Features.Auth.Commands;
using LibraryManagementSystem.Application.Interfaces;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace LibraryManagementSystem.Tests;

public class AuthTests
{
    private readonly Mock<IRepository<User>> _mockUserRepo;
    private readonly Mock<IJwtProvider> _mockJwtProvider;

    public AuthTests()
    {
        _mockUserRepo = new Mock<IRepository<User>>();
        _mockJwtProvider = new Mock<IJwtProvider>();
    }

    [Fact]
    public async Task RegisterUser_ShouldHashPassword_AndSaveUser()
    {
        // Arrange
        _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User>());

        var handler = new RegisterUserCommandHandler(_mockUserRepo.Object);
        var command = new RegisterUserCommand("newuser@lms.com", "Password123!", "Jane", "Doe", Role.Member);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotEqual(Guid.Empty, result);
        _mockUserRepo.Verify(r => r.AddAsync(It.Is<User>(u => u.Email == "newuser@lms.com" && u.PasswordHash != "Password123!")), Times.Once);
        _mockUserRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task RegisterUser_DuplicateEmail_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var existingUser = new User { Email = "existing@lms.com", PasswordHash = "hashed" };
        _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { existingUser });

        var handler = new RegisterUserCommandHandler(_mockUserRepo.Object);
        var command = new RegisterUserCommand("existing@lms.com", "Password123!", "Jane", "Doe", Role.Member);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task LoginUser_ValidCredentials_ShouldReturnJwtToken()
    {
        // Arrange
        var rawPassword = "Password123!";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(rawPassword);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@lms.com",
            PasswordHash = hashedPassword,
            Role = Role.Member
        };

        _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { user });

        _mockJwtProvider.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("fake-jwt-token");

        var handler = new LoginUserCommandHandler(_mockUserRepo.Object, _mockJwtProvider.Object);
        var command = new LoginUserCommand("user@lms.com", rawPassword);

        // Act
        var response = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(response);
        Assert.Equal("fake-jwt-token", response.Token);
        Assert.Equal(user.Email, response.Email);
    }
}
