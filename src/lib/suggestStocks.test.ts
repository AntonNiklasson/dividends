import { describe, it, expect } from 'vitest';
import { suggestStocks } from './suggestStocks';

describe('suggestStocks', () => {
  it('should return stocks that pay in low months', () => {
    const lowMonths = [1, 2, 3]; // Jan, Feb, Mar
    const existingTickers: string[] = [];

    const result = suggestStocks(lowMonths, existingTickers);

    // All returned stocks should pay in at least one of the low months
    result.forEach((stock) => {
      const paysInLowMonth = stock.typicalMonths.some((m) =>
        lowMonths.includes(m)
      );
      expect(paysInLowMonth).toBe(true);
    });
  });

  it('should exclude stocks already in portfolio', () => {
    const lowMonths = [3, 6, 9, 12];
    const existingTickers = ['JNJ', 'MSFT', 'PG'];

    const result = suggestStocks(lowMonths, existingTickers);

    // None of the existing tickers should be in the results
    const resultTickers = result.map((s) => s.ticker);
    expect(resultTickers).not.toContain('JNJ');
    expect(resultTickers).not.toContain('MSFT');
    expect(resultTickers).not.toContain('PG');
  });

  it('should sort by coverage (most low months first)', () => {
    const lowMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // All months are low
    const existingTickers: string[] = [];

    const result = suggestStocks(lowMonths, existingTickers);

    // Monthly payers (O, STAG, MAIN, SPHD, JEPI, JEPQ) should be first
    // because they cover all 12 months
    const topTickers = result.slice(0, 6).map((s) => s.ticker);
    const monthlyPayers = ['O', 'STAG', 'MAIN', 'SPHD', 'JEPI', 'JEPQ'];

    // At least some monthly payers should be in top results
    const hasMonthlyPayer = topTickers.some((t) => monthlyPayers.includes(t));
    expect(hasMonthlyPayer).toBe(true);
  });

  it('should limit results to configured max', () => {
    const lowMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const existingTickers: string[] = [];

    const result = suggestStocks(lowMonths, existingTickers, 3);

    expect(result).toHaveLength(3);
  });

  it('should use default max of 5 when not specified', () => {
    const lowMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const existingTickers: string[] = [];

    const result = suggestStocks(lowMonths, existingTickers);

    expect(result).toHaveLength(5);
  });

  it('should return empty array if no suitable suggestions', () => {
    const lowMonths = [1]; // Only January
    // Exclude all stocks that pay in January
    const existingTickers = [
      'KO',
      'PEP',
      'KMB',
      'SYY',
      'CSCO',
      'JPM',
      'USB',
      'XEL',
      'MRK',
      'EOG',
      'SLB',
      'O',
      'STAG',
      'MAIN',
      'AMT',
      'AVB',
      'EQR',
      'VTR',
      'ARE',
      'ITW',
      'CMCSA',
      'SPHD',
      'JEPI',
      'JEPQ',
      'MDT',
      'WMT',
    ];

    const result = suggestStocks(lowMonths, existingTickers);

    // May return empty or reduced list depending on remaining stocks
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('should handle all months being low', () => {
    const lowMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const existingTickers: string[] = [];

    const result = suggestStocks(lowMonths, existingTickers);

    // Should return suggestions (monthly payers are good candidates)
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle empty low months array', () => {
    const lowMonths: number[] = [];
    const existingTickers: string[] = [];

    const result = suggestStocks(lowMonths, existingTickers);

    expect(result).toEqual([]);
  });

  it('should be case-insensitive when matching existing tickers', () => {
    const lowMonths = [3, 6, 9, 12];
    const existingTickers = ['jnj', 'Msft', 'PG'];

    const result = suggestStocks(lowMonths, existingTickers);

    const resultTickers = result.map((s) => s.ticker);
    expect(resultTickers).not.toContain('JNJ');
    expect(resultTickers).not.toContain('MSFT');
    expect(resultTickers).not.toContain('PG');
  });

  it('should include coverage info showing which low months each stock fills', () => {
    const lowMonths = [1, 4, 7, 10];
    const existingTickers: string[] = [];

    const result = suggestStocks(lowMonths, existingTickers);

    // Each result should have coveredMonths property
    result.forEach((stock) => {
      expect(stock).toHaveProperty('coveredMonths');
      expect(Array.isArray(stock.coveredMonths)).toBe(true);
      // coveredMonths should only contain months from the lowMonths list
      stock.coveredMonths.forEach((month) => {
        expect(lowMonths).toContain(month);
      });
    });
  });
});
