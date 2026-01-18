import { describe, it, expect } from 'vitest';
import { EXAMPLE_STOCKS, getRandomExampleStocks } from '@/lib/exampleStocks';

describe('exampleStocks', () => {
  describe('EXAMPLE_STOCKS', () => {
    it('should have a substantial pool of stocks', () => {
      expect(EXAMPLE_STOCKS.length).toBeGreaterThanOrEqual(50);
    });

    it('should have unique tickers', () => {
      const tickers = EXAMPLE_STOCKS.map((s) => s.ticker);
      const uniqueTickers = new Set(tickers);
      expect(uniqueTickers.size).toBe(tickers.length);
    });

    it('should include stocks from multiple currencies', () => {
      const currencies = new Set(EXAMPLE_STOCKS.map((s) => s.currency));
      expect(currencies.size).toBeGreaterThan(5);
      expect(currencies.has('USD')).toBe(true);
      expect(currencies.has('EUR')).toBe(true);
      expect(currencies.has('SEK')).toBe(true);
    });

    it('should have valid stock structure', () => {
      for (const stock of EXAMPLE_STOCKS) {
        expect(stock.ticker).toBeTruthy();
        expect(stock.name).toBeTruthy();
        expect(stock.currency).toBeTruthy();
      }
    });
  });

  describe('getRandomExampleStocks', () => {
    it('should return stocks within the specified range', () => {
      const result = getRandomExampleStocks(10, 20);
      expect(result.length).toBeGreaterThanOrEqual(10);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should return PersistedStock format with shares set to 10', () => {
      const result = getRandomExampleStocks(5, 5);
      for (const stock of result) {
        expect(stock).toHaveProperty('ticker');
        expect(stock).toHaveProperty('name');
        expect(stock).toHaveProperty('currency');
        expect(stock).toHaveProperty('shares');
        expect(stock.shares).toBe(10);
      }
    });

    it('should exclude specified tickers', () => {
      const exclude = ['AAPL', 'MSFT', 'GOOGL'];
      const result = getRandomExampleStocks(10, 50, exclude);
      const resultTickers = result.map((s) => s.ticker);
      for (const excluded of exclude) {
        expect(resultTickers).not.toContain(excluded);
      }
    });

    it('should handle case-insensitive exclusion', () => {
      const exclude = ['aapl', 'msft']; // lowercase
      const result = getRandomExampleStocks(10, 50, exclude);
      const resultTickers = result.map((s) => s.ticker);
      expect(resultTickers).not.toContain('AAPL');
      expect(resultTickers).not.toContain('MSFT');
    });

    it('should return unique stocks (no duplicates)', () => {
      const result = getRandomExampleStocks(30, 50);
      const tickers = result.map((s) => s.ticker);
      const uniqueTickers = new Set(tickers);
      expect(uniqueTickers.size).toBe(tickers.length);
    });

    it('should return empty array when all stocks are excluded', () => {
      const allTickers = EXAMPLE_STOCKS.map((s) => s.ticker);
      const result = getRandomExampleStocks(10, 50, allTickers);
      expect(result).toEqual([]);
    });

    it('should cap at available stocks when requesting more than available', () => {
      const halfTickers = EXAMPLE_STOCKS.slice(0, EXAMPLE_STOCKS.length / 2).map(
        (s) => s.ticker
      );
      const result = getRandomExampleStocks(100, 200, halfTickers);
      // Should only return remaining stocks (roughly half)
      expect(result.length).toBeLessThanOrEqual(
        EXAMPLE_STOCKS.length - halfTickers.length
      );
    });

    it('should produce different results on different calls (randomization)', () => {
      // Run multiple times and check that results differ
      const results: string[][] = [];
      for (let i = 0; i < 10; i++) {
        const result = getRandomExampleStocks(20, 30);
        results.push(result.map((s) => s.ticker).sort());
      }

      // Check that at least 2 results are different
      const uniqueResults = new Set(results.map((r) => JSON.stringify(r)));
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should handle min equal to max', () => {
      const result = getRandomExampleStocks(15, 15);
      expect(result.length).toBe(15);
    });

    it('should handle min of 0', () => {
      const result = getRandomExampleStocks(0, 10);
      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });
});
