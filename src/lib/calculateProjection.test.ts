import { describe, it, expect } from 'vitest';
import { calculateProjection } from './calculateProjection';
import { StockWithDividends } from './types';

describe('calculateProjection', () => {
  describe('basic projection', () => {
    it('should project single stock with one dividend per year', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Company',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 50,
          hasDividends: true,
          dividendSchedule: [
            { month: 3, day: 15, amount: 1.0 }, // $1.00 per share in March
          ],
        },
      ];

      const result = calculateProjection(stocks);

      // Year 2026 - March payment
      expect(result[2026].months[2].payments).toHaveLength(1);
      expect(result[2026].months[2].payments[0]).toEqual({
        ticker: 'TEST',
        amount: 100, // 100 shares * $1.00
        currency: 'USD',
        date: '2026-03-15',
        sharesAtPayment: 100,
      });
      expect(result[2026].months[2].total).toEqual({ USD: 100 });
      expect(result[2026].yearTotal).toEqual({ USD: 100 });
    });

    it('should project stock with quarterly dividends', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          initialShares: 50,
          currency: 'USD',
          currentPrice: 185.5,
          hasDividends: true,
          dividendSchedule: [
            { month: 2, day: 15, amount: 0.24 },
            { month: 5, day: 15, amount: 0.24 },
            { month: 8, day: 15, amount: 0.24 },
            { month: 11, day: 15, amount: 0.24 },
          ],
        },
      ];

      const result = calculateProjection(stocks);

      // Check all four quarters have payments
      expect(result[2026].months[1].payments).toHaveLength(1); // Feb
      expect(result[2026].months[4].payments).toHaveLength(1); // May
      expect(result[2026].months[7].payments).toHaveLength(1); // Aug
      expect(result[2026].months[10].payments).toHaveLength(1); // Nov

      // Each payment should be 50 shares * $0.24 = $12.00
      expect(result[2026].months[1].payments[0].amount).toBe(12);
      expect(result[2026].months[1].payments[0].sharesAtPayment).toBe(50);
    });

    it('should handle stocks with no dividend history', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TSLA',
          name: 'Tesla',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 250,
          hasDividends: false,
          dividendSchedule: [],
        },
      ];

      const result = calculateProjection(stocks);

      // No dividends should be projected
      expect(result[2026].yearTotal).toEqual({});
      expect(result[2027].yearTotal).toEqual({});
      expect(result[2028].yearTotal).toEqual({});
    });
  });

  describe('DRIP reinvestment', () => {
    it('should reinvest dividends and compound over time', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Company',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 50,
          hasDividends: true,
          dividendSchedule: [
            { month: 6, day: 15, amount: 2.0 }, // $2.00 per share
          ],
        },
      ];

      const result = calculateProjection(stocks);

      // 2026: 100 shares * $2.00 = $200 dividend
      expect(result[2026].months[5].payments[0].amount).toBe(200);
      expect(result[2026].months[5].payments[0].sharesAtPayment).toBe(100);

      // Reinvest: $200 / $50 = 4 new shares
      // Total shares after 2026: 104 shares

      // 2027: 104 shares * $2.00 = $208 dividend
      expect(result[2027].months[5].payments[0].amount).toBe(208);
      expect(result[2027].months[5].payments[0].sharesAtPayment).toBe(104);

      // Reinvest: $208 / $50 = 4.16 new shares
      // Total shares after 2027: 108.16 shares

      // 2028: 108.16 shares * $2.00 = $216.32 dividend
      expect(result[2028].months[5].payments[0].amount).toBeCloseTo(216.32, 2);
      expect(result[2028].months[5].payments[0].sharesAtPayment).toBeCloseTo(
        108.16,
        2
      );
    });

    it('should compound multiple dividends within same year', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Company',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [
            { month: 3, day: 15, amount: 1.0 },
            { month: 9, day: 15, amount: 1.0 },
          ],
        },
      ];

      const result = calculateProjection(stocks);

      // First dividend in March: 100 shares * $1.00 = $100
      expect(result[2026].months[2].payments[0].amount).toBe(100);
      expect(result[2026].months[2].payments[0].sharesAtPayment).toBe(100);

      // After March: 100 + ($100 / $100) = 101 shares

      // Second dividend in September: 101 shares * $1.00 = $101
      expect(result[2026].months[8].payments[0].amount).toBe(101);
      expect(result[2026].months[8].payments[0].sharesAtPayment).toBe(101);

      // Year total: $100 + $101 = $201
      expect(result[2026].yearTotal.USD).toBe(201);
    });
  });

  describe('multiple currencies', () => {
    it('should aggregate totals by currency', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 180,
          hasDividends: true,
          dividendSchedule: [{ month: 3, day: 15, amount: 1.0 }],
        },
        {
          ticker: 'NESN.SW',
          name: 'Nestle',
          initialShares: 20,
          currency: 'CHF',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [{ month: 3, day: 10, amount: 2.0 }],
        },
        {
          ticker: 'SAP',
          name: 'SAP',
          initialShares: 5,
          currency: 'EUR',
          currentPrice: 150,
          hasDividends: true,
          dividendSchedule: [{ month: 5, day: 20, amount: 3.0 }],
        },
      ];

      const result = calculateProjection(stocks);

      // March: AAPL ($10) + NESN.SW (40 CHF)
      expect(result[2026].months[2].total).toEqual({
        USD: 10,
        CHF: 40,
      });

      // May: SAP (15 EUR)
      expect(result[2026].months[4].total).toEqual({
        EUR: 15,
      });

      // Year total
      expect(result[2026].yearTotal).toEqual({
        USD: 10,
        CHF: 40,
        EUR: 15,
      });
    });

    it('should not mix currencies in totals', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST1',
          name: 'Test 1',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 50,
          hasDividends: true,
          dividendSchedule: [{ month: 6, day: 15, amount: 1.0 }],
        },
        {
          ticker: 'TEST2',
          name: 'Test 2',
          initialShares: 50,
          currency: 'EUR',
          currentPrice: 50,
          hasDividends: true,
          dividendSchedule: [{ month: 6, day: 15, amount: 1.0 }],
        },
      ];

      const result = calculateProjection(stocks);

      expect(result[2026].months[5].total).toEqual({
        USD: 100,
        EUR: 50,
      });

      // Verify they're kept separate
      expect(result[2026].yearTotal.USD).toBe(100);
      expect(result[2026].yearTotal.EUR).toBe(50);
    });
  });

  describe('multi-year compounding', () => {
    it('should compound DRIP across all three years', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Company',
          initialShares: 1000,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [{ month: 12, day: 31, amount: 5.0 }],
        },
      ];

      const result = calculateProjection(stocks);

      // 2026: 1000 shares * $5 = $5000
      expect(result[2026].yearTotal.USD).toBe(5000);

      // After 2026: 1000 + ($5000 / $100) = 1050 shares

      // 2027: 1050 shares * $5 = $5250
      expect(result[2027].yearTotal.USD).toBe(5250);

      // After 2027: 1050 + ($5250 / $100) = 1102.5 shares

      // 2028: 1102.5 shares * $5 = $5512.50
      expect(result[2028].yearTotal.USD).toBeCloseTo(5512.5, 2);
    });

    it('should track shares independently per stock', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'STOCK1',
          name: 'Stock 1',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 50,
          hasDividends: true,
          dividendSchedule: [{ month: 6, day: 1, amount: 1.0 }],
        },
        {
          ticker: 'STOCK2',
          name: 'Stock 2',
          initialShares: 200,
          currency: 'USD',
          currentPrice: 25,
          hasDividends: true,
          dividendSchedule: [{ month: 6, day: 15, amount: 0.5 }],
        },
      ];

      const result = calculateProjection(stocks);

      // STOCK1 in 2026: 100 shares * $1.00 = $100
      const stock1Payment2026 = result[2026].months[5].payments.find(
        (p) => p.ticker === 'STOCK1'
      );
      expect(stock1Payment2026?.amount).toBe(100);
      expect(stock1Payment2026?.sharesAtPayment).toBe(100);

      // STOCK2 in 2026: 200 shares * $0.50 = $100
      const stock2Payment2026 = result[2026].months[5].payments.find(
        (p) => p.ticker === 'STOCK2'
      );
      expect(stock2Payment2026?.amount).toBe(100);
      expect(stock2Payment2026?.sharesAtPayment).toBe(200);

      // In 2027, shares should have increased independently
      // STOCK1: 100 + ($100 / $50) = 102 shares
      const stock1Payment2027 = result[2027].months[5].payments.find(
        (p) => p.ticker === 'STOCK1'
      );
      expect(stock1Payment2027?.sharesAtPayment).toBe(102);
      expect(stock1Payment2027?.amount).toBe(102);

      // STOCK2: 200 + ($100 / $25) = 204 shares
      const stock2Payment2027 = result[2027].months[5].payments.find(
        (p) => p.ticker === 'STOCK2'
      );
      expect(stock2Payment2027?.sharesAtPayment).toBe(204);
      expect(stock2Payment2027?.amount).toBe(102);
    });
  });

  describe('edge cases', () => {
    it('should handle empty stock list', () => {
      const stocks: StockWithDividends[] = [];
      const result = calculateProjection(stocks);

      expect(result[2026].yearTotal).toEqual({});
      expect(result[2027].yearTotal).toEqual({});
      expect(result[2028].yearTotal).toEqual({});
    });

    it('should handle months with no dividends', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Company',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 50,
          hasDividends: true,
          dividendSchedule: [{ month: 6, day: 15, amount: 1.0 }],
        },
      ];

      const result = calculateProjection(stocks);

      // January should have no payments
      expect(result[2026].months[0].payments).toHaveLength(0);
      expect(result[2026].months[0].total).toEqual({});

      // June should have payment
      expect(result[2026].months[5].payments).toHaveLength(1);
    });

    it('should handle fractional shares from DRIP', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Company',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 33.33,
          hasDividends: true,
          dividendSchedule: [{ month: 6, day: 15, amount: 1.0 }],
        },
      ];

      const result = calculateProjection(stocks);

      // 2026: 100 shares * $1.00 = $100 dividend
      // Reinvest: $100 / $33.33 = 3.00030003... shares
      const totalShares2026 = 100 + 100 / 33.33;

      // 2027: should use fractional shares
      expect(result[2027].months[5].payments[0].sharesAtPayment).toBeCloseTo(
        totalShares2026,
        4
      );
      expect(result[2027].months[5].payments[0].amount).toBeCloseTo(
        totalShares2026 * 1.0,
        2
      );
    });

    it('should sort dividends by date within same month', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'EARLY',
          name: 'Early Payer',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [{ month: 3, day: 5, amount: 1.0 }],
        },
        {
          ticker: 'LATE',
          name: 'Late Payer',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [{ month: 3, day: 25, amount: 1.0 }],
        },
      ];

      const result = calculateProjection(stocks);

      // Both should be in March
      const marchPayments = result[2026].months[2].payments;
      expect(marchPayments).toHaveLength(2);

      // EARLY should come first
      expect(marchPayments[0].ticker).toBe('EARLY');
      expect(marchPayments[0].date).toBe('2026-03-05');

      // LATE should come second
      expect(marchPayments[1].ticker).toBe('LATE');
      expect(marchPayments[1].date).toBe('2026-03-25');
    });

    it('should handle mix of dividend and non-dividend stocks', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'DIVVY',
          name: 'Dividend Stock',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 50,
          hasDividends: true,
          dividendSchedule: [{ month: 6, day: 15, amount: 1.0 }],
        },
        {
          ticker: 'GROWTH',
          name: 'Growth Stock',
          initialShares: 50,
          currency: 'USD',
          currentPrice: 200,
          hasDividends: false,
          dividendSchedule: [],
        },
      ];

      const result = calculateProjection(stocks);

      // Only DIVVY should have payments
      expect(result[2026].months[5].payments).toHaveLength(1);
      expect(result[2026].months[5].payments[0].ticker).toBe('DIVVY');
      expect(result[2026].yearTotal.USD).toBe(100);
    });
  });
});
