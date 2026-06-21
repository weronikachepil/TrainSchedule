'use client';

import { useState, useEffect, useCallback } from 'react';
import { trainsApi } from '@/lib/api';
import type { Train } from '@/types';

interface UseTrainsReturn {
  trains: Train[];
  loading: boolean;
  error: string | null;
  create: (data: Omit<Train, 'id' | 'createdAt'>) => Promise<void>;
  update: (id: number, data: Omit<Train, 'id' | 'createdAt'>) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export function useTrains(): UseTrainsReturn {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setTrains(await trainsApi.getAll());
    } catch {
      setError('Не вдалося завантажити розклад');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<Train, 'id' | 'createdAt'>) => {
    const created = await trainsApi.create(data);
    setTrains(prev => [...prev, created]);
  }, []);

  const update = useCallback(async (id: number, data: Omit<Train, 'id' | 'createdAt'>) => {
    const updated = await trainsApi.update(id, data);
    setTrains(prev => prev.map(t => t.id === id ? updated : t));
  }, []);

  const remove = useCallback(async (id: number) => {
    await trainsApi.delete(id);
    setTrains(prev => prev.filter(t => t.id !== id));
  }, []);

  return { trains, loading, error, create, update, remove };
}
