using AutoMapper;
using LibraryManagementSystem.Application.DTOs;
using LibraryManagementSystem.Domain.Entities;
using LibraryManagementSystem.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Application.Features.Reservations.Queries;

public record GetAllReservationsQuery : IRequest<IEnumerable<ReservationDto>>;

public class GetAllReservationsQueryHandler : IRequestHandler<GetAllReservationsQuery, IEnumerable<ReservationDto>>
{
    private readonly IRepository<Reservation> _reservationRepo;
    private readonly IMapper _mapper;

    public GetAllReservationsQueryHandler(IRepository<Reservation> reservationRepo, IMapper mapper)
    {
        _reservationRepo = reservationRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ReservationDto>> Handle(GetAllReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _reservationRepo.GetQueryable()
            .Include(r => r.Book)
            .Include(r => r.User)
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IEnumerable<ReservationDto>>(reservations);
    }
}
