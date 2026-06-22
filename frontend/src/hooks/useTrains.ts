'use client';

import { useState, useEffect, useCallback } from 'react';
import { trainsApi } from '@/lib/api';
import type { Train, TrainData } from '@/types';

interface SearchParams {
  search: string;
  departureDate: string;
  arrivalDate: string;
}

interface UseTrainsReturn {
  trains: Train[];
  loading: boolean;
  error: string | null;
  create: (data: TrainData) => Promise<void>;
  update: (id: number, data: TrainData) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export function useTrains({ search, departureDate, arrivalDate }: SearchParams): UseTrainsReturn {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTrains(await trainsApi.getAll({
        search:        search        || undefined,
        departureDate: departureDate || undefined,
        arrivalDate:   arrivalDate   || undefined,
      }));
    } catch {
      setError('Не вдалося завантажити розклад');
    } finally {
      setLoading(false);
    }
  }, [search, departureDate, arrivalDate]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: TrainData) => {
    const created = await trainsApi.create(data);
    setTrains(prev => [...prev, created]);
  }, []);

  const update = useCallback(async (id: number, data: TrainData) => {
    const updated = await trainsApi.update(id, data);
    setTrains(prev => prev.map(t => t.id === id ? updated : t));
  }, []);

  const remove = useCallback(async (id: number) => {
    await trainsApi.delete(id);
    setTrains(prev => prev.filter(t => t.id !== id));
  }, []);

  return { trains, loading, error, create, update, remove };
}
