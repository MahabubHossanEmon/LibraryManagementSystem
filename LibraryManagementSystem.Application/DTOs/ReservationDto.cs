namespace LibraryManagementSystem.Application.DTOs;

public class ReservationDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime ReservationDate { get; set; }
    public string StatusName { get; set; } = string.Empty;
}
