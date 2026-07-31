import { AuthResponseDto, BookDto, BorrowRecordDto, BranchDto, DashboardStatsDto, ReservationDto, Role, UserDto } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5072/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lms_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.text();
      if (errorData) {
        try {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.message || parsed.title || errorData;
        } catch {
          errorMessage = errorData;
        }
      }
    } catch {
      // fallback to default status text
    }
    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: { email: string; password: string; firstName: string; lastName: string; role: Role }) =>
    request<{ userId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboardStats: () => request<DashboardStatsDto>('/dashboard/stats'),

  // Books
  getBooks: () => request<BookDto[]>('/books'),
  getBookById: (id: string) => request<BookDto>(`/books/${id}`),
  createBook: (data: Omit<BookDto, 'id' | 'branchName' | 'availableCopies'>) =>
    request<string>('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBook: (id: string, data: Partial<BookDto> & { id: string }) =>
    request<void>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBook: (id: string) =>
    request<void>(`/books/${id}`, {
      method: 'DELETE',
    }),

  // Branches
  getBranches: () => request<BranchDto[]>('/branches'),
  getBranchById: (id: string) => request<BranchDto>(`/branches/${id}`),
  createBranch: (data: Omit<BranchDto, 'id'>) =>
    request<string>('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBranch: (id: string, data: BranchDto) =>
    request<void>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBranch: (id: string) =>
    request<void>(`/branches/${id}`, {
      method: 'DELETE',
    }),

  // Users / Members
  getUsers: () => request<UserDto[]>('/users'),
  updateUserRole: (id: string, role: Role) =>
    request<void>(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(role),
    }),

  // Borrows
  getBorrows: () => request<BorrowRecordDto[]>('/borrows'),
  getUserBorrows: (userId: string) => request<BorrowRecordDto[]>(`/borrows/user/${userId}`),
  borrowBook: (data: { bookId: string; userId: string; daysToBorrow?: number }) =>
    request<{ id: string; message: string }>('/borrows', {
      method: 'POST',
      body: JSON.stringify({ ...data, daysToBorrow: data.daysToBorrow || 14 }),
    }),
  returnBook: (borrowId: string) =>
    request<{ success: boolean; message: string }>(`/borrows/${borrowId}/return`, {
      method: 'POST',
    }),

  // Reservations
  getReservations: () => request<ReservationDto[]>('/reservations'),
  getUserReservations: (userId: string) => request<ReservationDto[]>(`/reservations/user/${userId}`),
  reserveBook: (data: { bookId: string; userId: string }) =>
    request<{ id: string; message: string }>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancelReservation: (reservationId: string) =>
    request<{ success: boolean; message: string }>(`/reservations/${reservationId}/cancel`, {
      method: 'POST',
    }),
  fulfillReservation: (reservationId: string) =>
    request<{ success: boolean; message: string }>(`/reservations/${reservationId}/fulfill`, {
      method: 'POST',
    }),
};
