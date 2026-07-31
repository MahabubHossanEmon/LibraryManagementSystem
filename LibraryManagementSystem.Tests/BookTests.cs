using LibraryManagementSystem.Application.Features.Books.Commands;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using Moq;
using Xunit;

namespace LibraryManagementSystem.Tests;

public class BookTests
{
    private readonly Mock<IRepository<Book>> _mockBookRepo;

    public BookTests()
    {
        _mockBookRepo = new Mock<IRepository<Book>>();
    }

    [Fact]
    public async Task CreateBook_ShouldCreateBookWithCopies()
    {
        // Arrange
        var branchId = Guid.NewGuid();
        var handler = new CreateBookCommandHandler(_mockBookRepo.Object);
        var command = new CreateBookCommand("Clean Code", "Robert C. Martin", "978-0132350884", "Prentice Hall", 2008, 5, branchId);

        // Act
        var bookId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotEqual(Guid.Empty, bookId);
        _mockBookRepo.Verify(r => r.AddAsync(It.Is<Book>(b => b.Title == "Clean Code" && b.TotalCopies == 5 && b.AvailableCopies == 5)), Times.Once);
        _mockBookRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }
}
