
import { useState, useEffect, useCallback } from 'react';
import { cacheManager, CACHE_KEYS, CACHE_EXPIRATION } from '@/utils/cacheManager';

interface UseCacheOptions<T> {
  key: string;
  fetchData: () => Promise<T>;
  expiration?: number;
  enabled?: boolean;
  staleWhileRevalidate?: boolean;
}

interface UseCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
  isStale: boolean;
}

/**
 * Custom hook for caching data with AsyncStorage
 * Implements stale-while-revalidate pattern
 */
export function useCache<T>({
  key,
  fetchData,
  expiration = CACHE_EXPIRATION.MEDIUM,
  enabled = true,
  staleWhileRevalidate = true,
}: UseCacheOptions<T>): UseCacheReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  const loadData = useCallback(async (showStale: boolean = false) => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      // Try to get cached data first
      const cachedData = await cacheManager.get<T>(key);

      if (cachedData) {
        console.log(`Using cached data for ${key}`);
        setData(cachedData);
        setIsStale(false);
        setIsLoading(false);

        // If stale-while-revalidate is enabled, fetch fresh data in background
        if (staleWhileRevalidate) {
          fetchFreshData(false);
        }
        return;
      }

      // If no valid cache, try to get stale data while fetching
      if (showStale) {
        const staleData = await cacheManager.getStale<T>(key);
        if (staleData) {
          console.log(`Using stale data for ${key}`);
          setData(staleData);
          setIsStale(true);
        }
      }

      // Fetch fresh data
      await fetchFreshData(true);
    } catch (err) {
      console.error(`Error loading data for ${key}:`, err);
      setIsError(true);
      setError(err as Error);
      setIsLoading(false);
    }
  }, [key, enabled, staleWhileRevalidate, fetchData]);

  const fetchFreshData = useCallback(async (updateLoading: boolean = true) => {
    try {
      if (updateLoading) {
        setIsLoading(true);
      }

      console.log(`Fetching fresh data for ${key}`);
      const freshData = await fetchData();

      // Update cache
      await cacheManager.set(key, freshData, expiration);

      // Update state
      setData(freshData);
      setIsStale(false);
      setIsError(false);
      setError(null);
    } catch (err) {
      console.error(`Error fetching fresh data for ${key}:`, err);
      setIsError(true);
      setError(err as Error);
    } finally {
      if (updateLoading) {
        setIsLoading(false);
      }
    }
  }, [key, fetchData, expiration]);

  const refetch = useCallback(async () => {
    await fetchFreshData(true);
  }, [fetchFreshData]);

  const invalidate = useCallback(async () => {
    await cacheManager.remove(key);
    setData(null);
    setIsStale(false);
  }, [key]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    invalidate,
    isStale,
  };
}

/**
 * Hook for caching multiple data sources
 */
export function useMultiCache<T extends Record<string, any>>(
  configs: Array<{
    key: string;
    fetchData: () => Promise<any>;
    expiration?: number;
  }>
): {
  data: Partial<T>;
  isLoading: boolean;
  isError: boolean;
  refetchAll: () => Promise<void>;
} {
  const [data, setData] = useState<Partial<T>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const results: Partial<T> = {};

      for (const config of configs) {
        const cachedData = await cacheManager.get(config.key);
        
        if (cachedData) {
          results[config.key as keyof T] = cachedData;
        } else {
          const freshData = await config.fetchData();
          await cacheManager.set(config.key, freshData, config.expiration);
          results[config.key as keyof T] = freshData;
        }
      }

      setData(results);
      setIsError(false);
    } catch (err) {
      console.error('Error loading multi-cache data:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [configs]);

  const refetchAll = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    data,
    isLoading,
    isError,
    refetchAll,
  };
}
