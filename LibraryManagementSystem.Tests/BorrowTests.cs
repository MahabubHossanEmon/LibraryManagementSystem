using LibraryManagementSystem.Application.Features.Borrows.Commands;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using Moq;
using Xunit;

namespace LibraryManagementSystem.Tests;

public class BorrowTests
{
    private readonly Mock<IRepository<Book>> _mockBookRepo;
    private readonly Mock<IRepository<User>> _mockUserRepo;
    private readonly Mock<IRepository<BorrowRecord>> _mockBorrowRepo;

    public BorrowTests()
    {
        _mockBookRepo = new Mock<IRepository<Book>>();
        _mockUserRepo = new Mock<IRepository<User>>();
        _mockBorrowRepo = new Mock<IRepository<BorrowRecord>>();
    }

    [Fact]
    public async Task BorrowBook_AvailableCopy_ShouldDecrementCopies_AndCreateRecord()
    {
        // Arrange
        var bookId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var book = new Book { Id = bookId, Title = "Test Book", AvailableCopies = 3, TotalCopies = 3 };
        var user = new User { Id = userId, Email = "member@lms.com" };

        _mockBookRepo.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(book);
        _mockUserRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

        var handler = new BorrowBookCommandHandler(_mockBookRepo.Object, _mockUserRepo.Object, _mockBorrowRepo.Object);
        var command = new BorrowBookCommand(bookId, userId, 14);

        // Act
        var recordId = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotEqual(Guid.Empty, recordId);
        Assert.Equal(2, book.AvailableCopies);
        _mockBorrowRepo.Verify(r => r.AddAsync(It.Is<BorrowRecord>(br => br.BookId == bookId && br.UserId == userId && br.Status == BorrowStatus.Borrowed)), Times.Once);
        _mockBorrowRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task ReturnBook_ActiveBorrow_ShouldIncrementCopies_AndMarkReturned()
    {
        // Arrange
        var borrowId = Guid.NewGuid();
        var bookId = Guid.NewGuid();
        var book = new Book { Id = bookId, Title = "Test Book", AvailableCopies = 2, TotalCopies = 5 };
        var borrowRecord = new BorrowRecord
        {
            Id = borrowId,
            BookId = bookId,
            Book = book,
            Status = BorrowStatus.Borrowed,
            BorrowDate = DateTime.UtcNow.AddDays(-5),
            DueDate = DateTime.UtcNow.AddDays(9)
        };

        _mockBorrowRepo.Setup(r => r.GetByIdAsync(borrowId)).ReturnsAsync(borrowRecord);
        _mockBookRepo.Setup(r => r.GetByIdAsync(bookId)).ReturnsAsync(book);

        var handler = new ReturnBookCommandHandler(_mockBorrowRepo.Object, _mockBookRepo.Object);
        var command = new ReturnBookCommand(borrowId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result);
        Assert.Equal(3, book.AvailableCopies);
        Assert.Equal(BorrowStatus.Returned, borrowRecord.Status);
        Assert.NotNull(borrowRecord.ReturnDate);
        _mockBorrowRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }
}
