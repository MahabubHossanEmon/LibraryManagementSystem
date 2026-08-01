using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Reports.Queries;

public class BranchDistributionDto
{
    public string BranchName { get; set; } = string.Empty;
    public int BookCount { get; set; }
    public int Percentage { get; set; }
}

public class ReportsSummaryDto
{
    public int TotalBooks { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public int TotalBranches { get; set; }
    public int ActiveBorrows { get; set; }
    public int OverdueBorrows { get; set; }
    public int PendingReservations { get; set; }
    public int TotalMembers { get; set; }
    public int UtilizationRate { get; set; }
    public List<BranchDistributionDto> BranchDistribution { get; set; } = new();
}

public record GetReportsQuery() : IRequest<ReportsSummaryDto>;

public class GetReportsQueryHandler : IRequestHandler<GetReportsQuery, ReportsSummaryDto>
{
    private readonly IRepository<Book> _bookRepository;
    private readonly IRepository<Branch> _branchRepository;
    private readonly IRepository<BorrowRecord> _borrowRepository;
    private readonly IRepository<Reservation> _reservationRepository;
    private readonly IRepository<User> _userRepository;

    public GetReportsQueryHandler(
        IRepository<Book> bookRepository,
        IRepository<Branch> branchRepository,
        IRepository<BorrowRecord> borrowRepository,
        IRepository<Reservation> reservationRepository,
        IRepository<User> userRepository)
    {
        _bookRepository = bookRepository;
        _branchRepository = branchRepository;
        _borrowRepository = borrowRepository;
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
    }

    public async Task<ReportsSummaryDto> Handle(GetReportsQuery request, CancellationToken cancellationToken)
    {
        var books = (await _bookRepository.GetAllAsync()).ToList();
        var branches = (await _branchRepository.GetAllAsync()).ToList();
        var borrows = (await _borrowRepository.GetAllAsync()).ToList();
        var reservations = (await _reservationRepository.GetAllAsync()).ToList();
        var users = (await _userRepository.GetAllAsync()).ToList();

        int totalBooks = books.Count;
        int totalCopies = books.Sum(b => b.TotalCopies);
        int availableCopies = books.Sum(b => b.AvailableCopies);
        int totalBranches = branches.Count;
        int activeBorrows = borrows.Count(b => b.ReturnDate == null);
        int overdueBorrows = borrows.Count(b => b.ReturnDate == null && b.DueDate < DateTime.UtcNow);
        int pendingReservations = reservations.Count(r => r.Status == Domain.Enums.ReservationStatus.Pending);
        int totalMembers = users.Count(u => u.Role == Domain.Enums.Role.Member);

        int utilizationRate = totalCopies > 0 
            ? (int)Math.Round(((double)(totalCopies - availableCopies) / totalCopies) * 100)
            : 0;

        var branchDistribution = branches.Select(b =>
        {
            int branchBooks = books.Where(bk => bk.BranchId == b.Id).Sum(bk => bk.TotalCopies);
            int percentage = totalCopies > 0 ? (int)Math.Round(((double)branchBooks / totalCopies) * 100) : 0;
            return new BranchDistributionDto
            {
                BranchName = b.Name,
                BookCount = branchBooks,
                Percentage = percentage
            };
        }).ToList();

        return new ReportsSummaryDto
        {
            TotalBooks = totalBooks,
            TotalCopies = totalCopies,
            AvailableCopies = availableCopies,
            TotalBranches = totalBranches,
            ActiveBorrows = activeBorrows,
            OverdueBorrows = overdueBorrows,
            PendingReservations = pendingReservations,
            TotalMembers = totalMembers,
            UtilizationRate = utilizationRate,
            BranchDistribution = branchDistribution
        };
    }
}
