/**
 * In-memory cache layer for stock data fetching
 *
 * Caches API responses with TTL (time-to-live) to reduce redundant calls.
 * Default TTL: 24 hours
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

// Default TTL: 24 hours in seconds
const DEFAULT_TTL_SECONDS = 24 * 60 * 60;

// Cache key prefixes for different data types
export const CACHE_KEYS = {
  DIVIDEND_DATA: 'dividends:',
  STOCK_SEARCH: 'search:',
} as const;

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const entry = store.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }

    return entry.value;
  },

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
  ): Promise<void> {
    store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  async delete(key: string): Promise<void> {
    store.delete(key);
  },

  async clearPrefix(prefix: string): Promise<void> {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) {
        store.delete(key);
      }
    }
  },
};
