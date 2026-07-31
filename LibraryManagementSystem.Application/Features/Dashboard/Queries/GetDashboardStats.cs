using LibraryManagementSystem.Application.DTOs;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Enums;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;

namespace LibraryManagementSystem.Application.Features.Dashboard.Queries;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IRepository<Book> _bookRepo;
    private readonly IRepository<Branch> _branchRepo;
    private readonly IRepository<BorrowRecord> _borrowRepo;
    private readonly IRepository<Reservation> _reservationRepo;
    private readonly IRepository<User> _userRepo;

    public GetDashboardStatsQueryHandler(
        IRepository<Book> bookRepo,
        IRepository<Branch> branchRepo,
        IRepository<BorrowRecord> borrowRepo,
        IRepository<Reservation> reservationRepo,
        IRepository<User> userRepo)
    {
        _bookRepo = bookRepo;
        _branchRepo = branchRepo;
        _borrowRepo = borrowRepo;
        _reservationRepo = reservationRepo;
        _userRepo = userRepo;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var books = await _bookRepo.GetAllAsync();
        var branches = await _branchRepo.GetAllAsync();
        var borrows = await _borrowRepo.GetAllAsync();
        var reservations = await _reservationRepo.GetAllAsync();
        var users = await _userRepo.GetAllAsync();

        var now = DateTime.UtcNow;

        return new DashboardStatsDto
        {
            TotalBooks = books.Count(),
            TotalCopies = books.Sum(b => b.TotalCopies),
            AvailableCopies = books.Sum(b => b.AvailableCopies),
            TotalBranches = branches.Count(),
            ActiveBorrows = borrows.Count(b => b.Status == BorrowStatus.Borrowed),
            OverdueBorrows = borrows.Count(b => b.Status == BorrowStatus.Borrowed && b.DueDate < now),
            PendingReservations = reservations.Count(r => r.Status == ReservationStatus.Pending),
            TotalMembers = users.Count()
        };
    }
}
