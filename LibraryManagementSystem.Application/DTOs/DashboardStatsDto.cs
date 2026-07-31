namespace LibraryManagementSystem.Application.DTOs;

public class DashboardStatsDto
{
    public int TotalBooks { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public int TotalBranches { get; set; }
    public int ActiveBorrows { get; set; }
    public int OverdueBorrows { get; set; }
    public int PendingReservations { get; set; }
    public int TotalMembers { get; set; }
}
