'use client';

import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UseFavoritesReturn {
  favoriteIds: Set<number>;
  toggle: (trainId: number) => Promise<void>;
  loading: boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    favoritesApi
      .getAll()
      .then(favs => setFavoriteIds(new Set(favs.map(f => f.trainId))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const toggle = useCallback(async (trainId: number) => {
    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(trainId)) next.delete(trainId);
      else next.add(trainId);
      return next;
    });
    try {
      const { saved } = await favoritesApi.toggle(trainId);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (saved) next.add(trainId);
        else next.delete(trainId);
        return next;
      });
    } catch {
      // Revert optimistic update on error
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(trainId)) next.delete(trainId);
        else next.add(trainId);
        return next;
      });
    }
  }, []);

  return { favoriteIds, toggle, loading };
}
