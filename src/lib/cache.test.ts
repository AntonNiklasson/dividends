import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cache, CACHE_KEYS } from '@/lib/cache';

describe('cache', () => {
  beforeEach(async () => {
    // Clear all cache entries before each test
    await cache.clearPrefix('');
  });

  describe('get and set', () => {
    it('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should store and retrieve a string value', async () => {
      await cache.set('test-key', 'test-value');
      const result = await cache.get<string>('test-key');
      expect(result).toBe('test-value');
    });

    it('should store and retrieve an object value', async () => {
      const obj = { name: 'AAPL', price: 150.25, dividends: [1.5, 1.5, 1.5] };
      await cache.set('stock-data', obj);
      const result = await cache.get<typeof obj>('stock-data');
      expect(result).toEqual(obj);
    });

    it('should store and retrieve an array value', async () => {
      const arr = [
        { symbol: 'AAPL', name: 'Apple' },
        { symbol: 'MSFT', name: 'Microsoft' },
      ];
      await cache.set('search-results', arr);
      const result = await cache.get<typeof arr>('search-results');
      expect(result).toEqual(arr);
    });

    it('should overwrite existing value with same key', async () => {
      await cache.set('key', 'value1');
      await cache.set('key', 'value2');
      const result = await cache.get<string>('key');
      expect(result).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('should return value before TTL expires', async () => {
      await cache.set('ttl-test', 'value', 60); // 60 seconds TTL
      const result = await cache.get<string>('ttl-test');
      expect(result).toBe('value');
    });

    it('should return null after TTL expires', async () => {
      vi.useFakeTimers();

      await cache.set('ttl-test', 'value', 1); // 1 second TTL

      // Value should exist immediately
      let result = await cache.get<string>('ttl-test');
      expect(result).toBe('value');

      // Advance time by 2 seconds
      vi.advanceTimersByTime(2000);

      // Value should be expired
      result = await cache.get<string>('ttl-test');
      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should use default TTL of 24 hours when not specified', async () => {
      vi.useFakeTimers();

      await cache.set('default-ttl', 'value');

      // Advance time by 23 hours - should still exist
      vi.advanceTimersByTime(23 * 60 * 60 * 1000);
      let result = await cache.get<string>('default-ttl');
      expect(result).toBe('value');

      // Advance another 2 hours (total 25 hours) - should be expired
      vi.advanceTimersByTime(2 * 60 * 60 * 1000);
      result = await cache.get<string>('default-ttl');
      expect(result).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('delete', () => {
    it('should delete existing key', async () => {
      await cache.set('delete-test', 'value');
      await cache.delete('delete-test');
      const result = await cache.get<string>('delete-test');
      expect(result).toBeNull();
    });

    it('should not throw when deleting non-existent key', async () => {
      await expect(cache.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('clearPrefix', () => {
    it('should clear all entries with matching prefix', async () => {
      await cache.set('dividends:AAPL', { price: 150 });
      await cache.set('dividends:MSFT', { price: 300 });
      await cache.set('search:apple', [{ symbol: 'AAPL' }]);

      await cache.clearPrefix('dividends:');

      expect(await cache.get('dividends:AAPL')).toBeNull();
      expect(await cache.get('dividends:MSFT')).toBeNull();
      expect(await cache.get('search:apple')).not.toBeNull();
    });

    it('should clear all entries when prefix is empty string', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      await cache.clearPrefix('');

      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBeNull();
    });
  });

  describe('CACHE_KEYS', () => {
    it('should have correct key prefixes', () => {
      expect(CACHE_KEYS.DIVIDEND_DATA).toBe('dividends:');
      expect(CACHE_KEYS.STOCK_SEARCH).toBe('search:');
    });

    it('should work with cache operations', async () => {
      const dividendKey = `${CACHE_KEYS.DIVIDEND_DATA}AAPL`;
      const searchKey = `${CACHE_KEYS.STOCK_SEARCH}apple`;

      await cache.set(dividendKey, { dividends: [] });
      await cache.set(searchKey, []);

      expect(await cache.get(dividendKey)).toEqual({ dividends: [] });
      expect(await cache.get(searchKey)).toEqual([]);
    });
  });
});
