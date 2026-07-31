export type Role = 'Admin' | 'Librarian' | 'Member';

export enum BorrowStatus {
  Issued = 0,
  Returned = 1,
  Overdue = 2,
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  activeBorrowsCount: number;
}

export interface BookDto {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  yearPublished: number;
  totalCopies: number;
  availableCopies: number;
  branchId: string;
  branchName: string;
}

export interface BranchDto {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
}

export interface BorrowRecordDto {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: BorrowStatus;
  statusName: string;
}

export interface ReservationDto {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  reservationDate: string;
  statusName: string;
}

export interface DashboardStatsDto {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  totalBranches: number;
  activeBorrows: number;
  overdueBorrows: number;
  pendingReservations: number;
  totalMembers: number;
}

export interface AuthResponseDto {
  token: string;
  userId: string;
  email: string;
  role: Role;
}
