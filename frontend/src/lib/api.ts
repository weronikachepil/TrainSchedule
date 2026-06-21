import type { Train, AuthResponse, Trip } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (res.status === 204 || !contentType?.includes('application/json')) return null as T;
  return res.json() as Promise<T>;
}

export const trainsApi = {
  getAll: (params?: { search?: string; departureDate?: string; arrivalDate?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search)        qs.set('search',        params.search);
    if (params?.departureDate) qs.set('departureDate', params.departureDate);
    if (params?.arrivalDate)   qs.set('arrivalDate',   params.arrivalDate);
    const q = qs.toString();
    return request<Train[]>(q ? `/trains?${q}` : '/trains');
  },
  create: (data: Omit<Train, 'id' | 'createdAt' | 'createdById'>) =>
    request<Train>('/trains', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Omit<Train, 'id' | 'createdAt' | 'createdById'>) =>
    request<Train>(`/trains/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/trains/${id}`, { method: 'DELETE' }),
};

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const favoritesApi = {
  getAll: () => request<{ id: number; trainId: number }[]>('/favorites'),
  toggle: (trainId: number) => request<{ saved: boolean }>(`/favorites/${trainId}`, { method: 'POST' }),
};

export const tripsApi = {
  getAll: () => request<Trip[]>('/trips'),
  create: (trainId: number, tripDate: string) =>
    request<Trip>('/trips', { method: 'POST', body: JSON.stringify({ trainId, tripDate }) }),
  delete: (id: number) => request<void>(`/trips/${id}`, { method: 'DELETE' }),
};
