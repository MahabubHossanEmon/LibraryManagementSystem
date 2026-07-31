using LibraryManagementSystem.Domain.Common;

namespace LibraryManagementSystem.Domain.Entities;

public class Book : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public int YearPublished { get; set; }
    
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    
    // Foreign Key
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    
    // Navigation properties
    public ICollection<BorrowRecord> BorrowRecords { get; set; } = new List<BorrowRecord>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
