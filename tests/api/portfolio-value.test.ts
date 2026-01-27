import { describe, it, expect } from 'vitest';
import { calculatePortfolioValue, calculateYearEndValue } from '@/lib/portfolioValue';
import type { StockWithDividends } from '@/lib/types';

describe('portfolioValue utilities', () => {
  describe('calculatePortfolioValue', () => {
    it('should return zero for empty portfolio', () => {
      const result = calculatePortfolioValue([]);

      expect(result.totalUSD).toBe(0);
      expect(result.stocks).toHaveLength(0);
    });

    it('should calculate correct total for single USD stock', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple Inc',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 185.50,
          hasDividends: true,
          dividendSchedule: [],
        },
      ];

      const result = calculatePortfolioValue(stocks);

      expect(result.totalUSD).toBe(1855);
      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].ticker).toBe('AAPL');
      expect(result.stocks[0].valueUSD).toBe(1855);
      expect(result.stocks[0].percent).toBe(100);
    });

    it('should calculate correct percentages for multiple stocks', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple Inc',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [],
        },
        {
          ticker: 'MSFT',
          name: 'Microsoft Corp',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 300,
          hasDividends: true,
          dividendSchedule: [],
        },
      ];

      const result = calculatePortfolioValue(stocks);

      expect(result.totalUSD).toBe(4000); // 1000 + 3000
      expect(result.stocks).toHaveLength(2);

      // Should be sorted by value descending
      expect(result.stocks[0].ticker).toBe('MSFT');
      expect(result.stocks[0].percent).toBe(75);
      expect(result.stocks[1].ticker).toBe('AAPL');
      expect(result.stocks[1].percent).toBe(25);
    });

    it('should convert non-USD currencies', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'VOLV-B.ST',
          name: 'Volvo B',
          initialShares: 100,
          currency: 'SEK',
          currentPrice: 100, // 100 SEK
          hasDividends: true,
          dividendSchedule: [],
        },
      ];

      const result = calculatePortfolioValue(stocks);

      // 100 shares * 100 SEK * 0.095 (SEK to USD rate) = 950 USD
      expect(result.totalUSD).toBeCloseTo(950, 0);
      expect(result.stocks[0].priceUSD).toBeCloseTo(9.5, 1);
    });

    it('should handle mixed currencies', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple Inc',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [],
        },
        {
          ticker: 'VOLV-B.ST',
          name: 'Volvo B',
          initialShares: 100,
          currency: 'SEK',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [],
        },
      ];

      const result = calculatePortfolioValue(stocks);

      // 1000 USD + 950 USD (from SEK) = 1950 USD
      expect(result.totalUSD).toBeCloseTo(1950, 0);
    });
  });

  describe('calculateYearEndValue', () => {
    const stocks: StockWithDividends[] = [
      {
        ticker: 'AAPL',
        name: 'Apple Inc',
        initialShares: 10,
        currency: 'USD',
        currentPrice: 100,
        hasDividends: true,
        dividendSchedule: [],
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft Corp',
        initialShares: 20,
        currency: 'USD',
        currentPrice: 200,
        hasDividends: true,
        dividendSchedule: [],
      },
    ];

    it('should use initial shares when no endOfYearShares provided', () => {
      const result = calculateYearEndValue(stocks, {});

      // 10 * 100 + 20 * 200 = 5000
      expect(result).toBe(5000);
    });

    it('should use endOfYearShares when provided', () => {
      const endOfYearShares = {
        AAPL: 15, // Increased from 10
        MSFT: 25, // Increased from 20
      };

      const result = calculateYearEndValue(stocks, endOfYearShares);

      // 15 * 100 + 25 * 200 = 6500
      expect(result).toBe(6500);
    });

    it('should handle partial endOfYearShares', () => {
      const endOfYearShares = {
        AAPL: 15, // Only AAPL increased
      };

      const result = calculateYearEndValue(stocks, endOfYearShares);

      // 15 * 100 + 20 * 200 = 5500
      expect(result).toBe(5500);
    });

    it('should convert currencies for year-end value', () => {
      const mixedStocks: StockWithDividends[] = [
        {
          ticker: 'VOLV-B.ST',
          name: 'Volvo B',
          initialShares: 100,
          currency: 'SEK',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [],
        },
      ];

      const endOfYearShares = { 'VOLV-B.ST': 110 };

      const result = calculateYearEndValue(mixedStocks, endOfYearShares);

      // 110 * 100 SEK * 0.095 = 1045 USD
      expect(result).toBeCloseTo(1045, 0);
    });

    it('should apply price multiplier for bullish scenario', () => {
      const singleStock: StockWithDividends[] = [stocks[0]]; // Just AAPL
      const endOfYearShares = { AAPL: 10 };

      // +10% per year, 2 years = 1.1^2 = 1.21
      const result = calculateYearEndValue(singleStock, endOfYearShares, 1.1, 2);

      // 10 * 100 * 1.21 = 1210
      expect(result).toBeCloseTo(1210, 0);
    });

    it('should apply price multiplier for bearish scenario', () => {
      const singleStock: StockWithDividends[] = [stocks[0]]; // Just AAPL
      const endOfYearShares = { AAPL: 10 };

      // -10% per year, 2 years = 0.9^2 = 0.81
      const result = calculateYearEndValue(singleStock, endOfYearShares, 0.9, 2);

      // 10 * 100 * 0.81 = 810
      expect(result).toBeCloseTo(810, 0);
    });

    it('should compound price changes correctly over 3 years', () => {
      const singleStock: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Stock',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [],
        },
      ];

      const endOfYearShares = { TEST: 100 };

      // +10% for 3 years = 1.1^3 = 1.331
      const bullish = calculateYearEndValue(singleStock, endOfYearShares, 1.1, 3);
      expect(bullish).toBeCloseTo(13310, 0); // 100 * 100 * 1.331

      // Flat = no change
      const flat = calculateYearEndValue(singleStock, endOfYearShares, 1, 3);
      expect(flat).toBe(10000); // 100 * 100

      // -10% for 3 years = 0.9^3 = 0.729
      const bearish = calculateYearEndValue(singleStock, endOfYearShares, 0.9, 3);
      expect(bearish).toBeCloseTo(7290, 0); // 100 * 100 * 0.729
    });
  });
});
