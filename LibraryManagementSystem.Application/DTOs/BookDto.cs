namespace LibraryManagementSystem.Application.DTOs;

public class BookDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public int YearPublished { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public Guid BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
}
