export interface Train {
  id: number;
  trainNumber: string;
  direction: string;
  departureTime: string;
  arrivalTime: string;
  station: string;
  createdById: number | null;
  createdAt: string;
}

export interface Trip {
  id: number;
  userId: number;
  trainId: number;
  train: Train;
  tripDate: string;
  note: string | null;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  role: string;
  id: number;
}

export const STATIONS = [
  'Київ',
  'Львів',
  'Одеса',
  'Харків',
  'Дніпро',
  'Запоріжжя',
  'Вінниця',
  'Полтава',
  'Чернівці',
  'Ужгород',
] as const;

export type Station = (typeof STATIONS)[number];
