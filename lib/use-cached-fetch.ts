'use client';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  promise: Promise<T>;
};

// Global cache map for all fetched data
const cache = new Map<string, CacheEntry<any>>();

// Cache expiration time (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Creates a suspense-compatible cached data fetcher
 * @param key Unique cache key for this data
 * @param fetchFn Function that returns a promise with the data
 * @param options Optional configuration
 */
export function createCachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    ttl?: number;
    revalidate?: boolean;
  }
) {
  const ttl = options?.ttl || CACHE_TTL;

  return () => {
    // Check if we have a valid cached entry
    const entry = cache.get(key);
    const now = Date.now();

    // If we have a cached entry that hasn't expired, return its promise
    if (entry && now - entry.timestamp < ttl && !options?.revalidate) {
      return entry.promise;
    }

    // Otherwise, create a new promise and cache it
    const promise = fetchFn().then((data) => {
      // Update the cache with the resolved data
      cache.set(key, {
        data,
        timestamp: Date.now(),
        promise: Promise.resolve(data)
      });
      return data;
    });

    // Store the pending promise in the cache
    if (!entry) {
      cache.set(key, {
        data: undefined as any,
        timestamp: now,
        promise
      });
    }

    return promise;
  };
}

/**
 * Manually invalidates a cached entry to force a refresh on next access
 * @param key The cache key to invalidate
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Gets data from cache without triggering a fetch
 * @param key The cache key
 * @returns The cached data or undefined if not in cache
 */
export function getFromCache<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return undefined;
}
