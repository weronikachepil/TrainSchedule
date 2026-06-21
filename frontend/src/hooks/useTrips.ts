'use client';

import { useState, useEffect, useCallback } from 'react';
import { tripsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Trip } from '@/types';

interface UseTripsReturn {
  trips: Trip[];
  plan: (trainId: number, tripDate: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  loading: boolean;
}

export function useTrips(): UseTripsReturn {
  const { isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setTrips([]);
      return;
    }
    setLoading(true);
    tripsApi
      .getAll()
      .then(setTrips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const plan = useCallback(async (trainId: number, tripDate: string) => {
    const trip = await tripsApi.create(trainId, tripDate);
    setTrips(prev => [...prev, trip].sort((a, b) => a.tripDate.localeCompare(b.tripDate)));
  }, []);

  const remove = useCallback(async (id: number) => {
    await tripsApi.delete(id);
    setTrips(prev => prev.filter(t => t.id !== id));
  }, []);

  return { trips, plan, remove, loading };
}
