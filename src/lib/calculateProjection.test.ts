import { describe, it, expect } from 'vitest';
import { calculateProjection } from './calculateProjection';
import { StockWithDividends } from './types';

// Dynamic years for tests
const YEAR_1 = new Date().getFullYear();
const YEAR_2 = YEAR_1 + 1;
const YEAR_3 = YEAR_1 + 2;

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
      expect(result[YEAR_1].months[2].payments).toHaveLength(1);
      expect(result[YEAR_1].months[2].payments[0]).toEqual({
        ticker: 'TEST',
        name: 'Test Company',
        amount: 100, // 100 shares * $1.00
        currency: 'USD',
        date: `${YEAR_1}-03-15`,
        sharesAtPayment: 100,
      });
      expect(result[YEAR_1].months[2].total).toEqual({ USD: 100 });
      expect(result[YEAR_1].yearTotal).toEqual({ USD: 100 });
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
      expect(result[YEAR_1].months[1].payments).toHaveLength(1); // Feb
      expect(result[YEAR_1].months[4].payments).toHaveLength(1); // May
      expect(result[YEAR_1].months[7].payments).toHaveLength(1); // Aug
      expect(result[YEAR_1].months[10].payments).toHaveLength(1); // Nov

      // Each payment should be 50 shares * $0.24 = $12.00
      expect(result[YEAR_1].months[1].payments[0].amount).toBe(12);
      expect(result[YEAR_1].months[1].payments[0].sharesAtPayment).toBe(50);
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
      expect(result[YEAR_1].yearTotal).toEqual({});
      expect(result[YEAR_2].yearTotal).toEqual({});
      expect(result[YEAR_3].yearTotal).toEqual({});
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
      expect(result[YEAR_1].months[5].payments[0].amount).toBe(200);
      expect(result[YEAR_1].months[5].payments[0].sharesAtPayment).toBe(100);

      // Reinvest: $200 / $50 = 4 whole shares, $0 remainder
      // Total shares after 2026: 104 shares

      // 2027: 104 shares * $2.00 = $208 dividend
      expect(result[YEAR_2].months[5].payments[0].amount).toBe(208);
      expect(result[YEAR_2].months[5].payments[0].sharesAtPayment).toBe(104);

      // Reinvest: $208 / $50 = 4 whole shares, $8 remainder
      // Total shares after 2027: 108 shares

      // 2028: 108 shares * $2.00 = $216 dividend
      // Total cash: $8 + $216 = $224, buy 4 shares, remainder $24
      expect(result[YEAR_3].months[5].payments[0].amount).toBe(216);
      expect(result[YEAR_3].months[5].payments[0].sharesAtPayment).toBe(108);
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
      expect(result[YEAR_1].months[2].payments[0].amount).toBe(100);
      expect(result[YEAR_1].months[2].payments[0].sharesAtPayment).toBe(100);

      // After March: 100 + ($100 / $100) = 101 shares

      // Second dividend in September: 101 shares * $1.00 = $101
      expect(result[YEAR_1].months[8].payments[0].amount).toBe(101);
      expect(result[YEAR_1].months[8].payments[0].sharesAtPayment).toBe(101);

      // Year total: $100 + $101 = $201
      expect(result[YEAR_1].yearTotal.USD).toBe(201);
    });
  });

  describe('currency conversion to USD', () => {
    it('should convert all currencies to USD', () => {
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

      // March: AAPL ($10 USD) + NESN.SW (40 CHF * 1.12 = $44.80 USD)
      // Total: $54.80 USD
      expect(result[YEAR_1].months[2].total.USD).toBeCloseTo(54.8, 1);
      expect(result[YEAR_1].months[2].total.CHF).toBeUndefined();

      // May: SAP (15 EUR * 1.08 = $16.20 USD)
      expect(result[YEAR_1].months[4].total.USD).toBeCloseTo(16.2, 1);
      expect(result[YEAR_1].months[4].total.EUR).toBeUndefined();

      // All totals should be in USD only
      expect(Object.keys(result[YEAR_1].yearTotal)).toEqual(['USD']);
    });

    it('should aggregate all stocks into single USD total', () => {
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

      // USD: 100 * 1.0 = $100
      // EUR: 50 * 1.0 * 1.08 = $54
      // Total: $154
      expect(result[YEAR_1].months[5].total.USD).toBeCloseTo(154, 0);

      // Only USD key should exist
      expect(Object.keys(result[YEAR_1].yearTotal)).toEqual(['USD']);
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
      expect(result[YEAR_1].yearTotal.USD).toBe(5000);

      // After 2026: 1000 + floor($5000 / $100) = 1050 shares, $0 remainder

      // 2027: 1050 shares * $5 = $5250
      expect(result[YEAR_2].yearTotal.USD).toBe(5250);

      // After 2027: 1050 + floor($5250 / $100) = 1102 shares, $50 remainder

      // 2028: 1102 shares * $5 = $5510
      // (with $50 remainder, total cash = $5560, but dividend is based on shares)
      expect(result[YEAR_3].yearTotal.USD).toBe(5510);
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
      const stock1Payment2026 = result[YEAR_1].months[5].payments.find(
        (p) => p.ticker === 'STOCK1'
      );
      expect(stock1Payment2026?.amount).toBe(100);
      expect(stock1Payment2026?.sharesAtPayment).toBe(100);

      // STOCK2 in 2026: 200 shares * $0.50 = $100
      const stock2Payment2026 = result[YEAR_1].months[5].payments.find(
        (p) => p.ticker === 'STOCK2'
      );
      expect(stock2Payment2026?.amount).toBe(100);
      expect(stock2Payment2026?.sharesAtPayment).toBe(200);

      // In 2027, shares should have increased independently
      // STOCK1: 100 + ($100 / $50) = 102 shares
      const stock1Payment2027 = result[YEAR_2].months[5].payments.find(
        (p) => p.ticker === 'STOCK1'
      );
      expect(stock1Payment2027?.sharesAtPayment).toBe(102);
      expect(stock1Payment2027?.amount).toBe(102);

      // STOCK2: 200 + ($100 / $25) = 204 shares
      const stock2Payment2027 = result[YEAR_2].months[5].payments.find(
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

      expect(result[YEAR_1].yearTotal).toEqual({});
      expect(result[YEAR_2].yearTotal).toEqual({});
      expect(result[YEAR_3].yearTotal).toEqual({});
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
      expect(result[YEAR_1].months[0].payments).toHaveLength(0);
      expect(result[YEAR_1].months[0].total).toEqual({});

      // June should have payment
      expect(result[YEAR_1].months[5].payments).toHaveLength(1);
    });

    it('should only purchase whole shares and track remainder', () => {
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

      // Year 1: 100 shares * $1.00 = $100 dividend
      // Whole shares: floor($100 / $33.33) = 3 shares
      // Remainder: $100 - (3 * $33.33) = $0.01
      expect(result[YEAR_1].months[5].payments[0].sharesAtPayment).toBe(100);
      expect(result[YEAR_1].months[5].payments[0].amount).toBe(100);

      // Year 2: 103 shares * $1.00 = $103 dividend
      // Total cash: $0.01 + $103 = $103.01
      // Whole shares: floor($103.01 / $33.33) = 3 shares
      // New total: 106 shares
      expect(result[YEAR_2].months[5].payments[0].sharesAtPayment).toBe(103);
      expect(result[YEAR_2].months[5].payments[0].amount).toBe(103);

      // Year 3: 106 shares (no fractional shares)
      expect(result[YEAR_3].months[5].payments[0].sharesAtPayment).toBe(106);
    });

    it('should accumulate remainder cash until it can buy a share', () => {
      const stocks: StockWithDividends[] = [
        {
          ticker: 'TEST',
          name: 'Test Company',
          initialShares: 10,
          currency: 'USD',
          currentPrice: 100,
          hasDividends: true,
          dividendSchedule: [
            { month: 3, day: 15, amount: 3.0 }, // $30 dividend
            { month: 9, day: 15, amount: 3.0 }, // $30 dividend
          ],
        },
      ];

      const result = calculateProjection(stocks);

      // March: 10 shares * $3 = $30, can't buy any shares at $100
      expect(result[YEAR_1].months[2].payments[0].sharesAtPayment).toBe(10);

      // September: 10 shares * $3 = $30, total cash = $60, still can't buy
      expect(result[YEAR_1].months[8].payments[0].sharesAtPayment).toBe(10);

      // Year 2 March: cash = $60 + $30 = $90, still can't buy
      expect(result[YEAR_2].months[2].payments[0].sharesAtPayment).toBe(10);

      // Year 2 September: cash = $90 + $30 = $120, buy 1 share!
      // Remainder: $120 - $100 = $20
      expect(result[YEAR_2].months[8].payments[0].sharesAtPayment).toBe(10);

      // Year 3 March: 11 shares * $3 = $33, total cash = $20 + $33 = $53
      expect(result[YEAR_3].months[2].payments[0].sharesAtPayment).toBe(11);
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
      const marchPayments = result[YEAR_1].months[2].payments;
      expect(marchPayments).toHaveLength(2);

      // EARLY should come first
      expect(marchPayments[0].ticker).toBe('EARLY');
      expect(marchPayments[0].date).toBe(`${YEAR_1}-03-05`);

      // LATE should come second
      expect(marchPayments[1].ticker).toBe('LATE');
      expect(marchPayments[1].date).toBe(`${YEAR_1}-03-25`);
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
      expect(result[YEAR_1].months[5].payments).toHaveLength(1);
      expect(result[YEAR_1].months[5].payments[0].ticker).toBe('DIVVY');
      expect(result[YEAR_1].yearTotal.USD).toBe(100);
    });
  });

  describe('price growth scenarios', () => {
    // Stock setup: 100 shares at $100, $10 annual dividend
    // This means each dividend can buy 10 shares at flat prices
    const baseStock: StockWithDividends = {
      ticker: 'TEST',
      name: 'Test Company',
      initialShares: 100,
      currency: 'USD',
      currentPrice: 100,
      hasDividends: true,
      dividendSchedule: [{ month: 6, day: 15, amount: 10.0 }], // $1000 dividend per year
    };

    it('should accept annualPriceGrowth parameter', () => {
      const stocks = [baseStock];

      // Should not throw with the new parameter
      const flatResult = calculateProjection(stocks, 0);
      const bullishResult = calculateProjection(stocks, 0.1);
      const bearishResult = calculateProjection(stocks, -0.1);

      expect(flatResult).toBeDefined();
      expect(bullishResult).toBeDefined();
      expect(bearishResult).toBeDefined();
    });

    it('should buy fewer shares when prices rise', () => {
      const stocks = [baseStock];

      const flatResult = calculateProjection(stocks, 0);
      const bullishResult = calculateProjection(stocks, 0.1); // +10%/year

      // Year 1 dividend is the same (based on shares, not price)
      expect(flatResult[YEAR_1].yearTotal.USD).toBe(1000);
      expect(bullishResult[YEAR_1].yearTotal.USD).toBe(1000);

      // But with +10% prices, we buy fewer shares
      // Flat: $1000 / $100 = 10 shares -> 110 total
      // Bullish: $1000 / $110 = 9 shares -> 109 total
      expect(flatResult[YEAR_1].endOfYearShares!['TEST']).toBe(110);
      expect(bullishResult[YEAR_1].endOfYearShares!['TEST']).toBe(109);
    });

    it('should buy more shares when prices fall', () => {
      const stocks = [baseStock];

      const flatResult = calculateProjection(stocks, 0);
      const bearishResult = calculateProjection(stocks, -0.1); // -10%/year

      // Year 1 dividend is the same
      expect(flatResult[YEAR_1].yearTotal.USD).toBe(1000);
      expect(bearishResult[YEAR_1].yearTotal.USD).toBe(1000);

      // With -10% prices, we buy more shares
      // Flat: $1000 / $100 = 10 shares -> 110 total
      // Bearish: $1000 / $90 = 11 shares -> 111 total
      expect(flatResult[YEAR_1].endOfYearShares!['TEST']).toBe(110);
      expect(bearishResult[YEAR_1].endOfYearShares!['TEST']).toBe(111);
    });

    it('should compound price changes over multiple years', () => {
      const stocks = [baseStock];

      const bullishResult = calculateProjection(stocks, 0.1);
      const bearishResult = calculateProjection(stocks, -0.1);

      // Year 2: prices are 1.1^2 = 1.21x (bullish) or 0.9^2 = 0.81x (bearish)
      // Bullish Y1: 109 shares, Y2 dividend = 109 * $10 = $1090
      //   Buy: $1090 / $121 = 9 shares -> 118 total
      // Bearish Y1: 111 shares, Y2 dividend = 111 * $10 = $1110
      //   Buy: $1110 / $81 = 13 shares -> 124 total

      // The gap should widen each year
      const bullishY2Shares = bullishResult[YEAR_2].endOfYearShares!['TEST'];
      const bearishY2Shares = bearishResult[YEAR_2].endOfYearShares!['TEST'];

      expect(bearishY2Shares).toBeGreaterThan(bullishY2Shares);

      // Year 3 gap should be even wider
      const bullishY3Shares = bullishResult[YEAR_3].endOfYearShares!['TEST'];
      const bearishY3Shares = bearishResult[YEAR_3].endOfYearShares!['TEST'];

      expect(bearishY3Shares - bullishY3Shares).toBeGreaterThan(
        bearishY2Shares - bullishY2Shares
      );
    });

    it('should keep dividend payout amounts the same across scenarios', () => {
      const stocks = [baseStock];

      const flatResult = calculateProjection(stocks, 0);
      const bullishResult = calculateProjection(stocks, 0.1);
      const bearishResult = calculateProjection(stocks, -0.1);

      // Year 1: All start with 100 shares, so dividend is the same
      expect(flatResult[YEAR_1].yearTotal.USD).toBe(1000);
      expect(bullishResult[YEAR_1].yearTotal.USD).toBe(1000);
      expect(bearishResult[YEAR_1].yearTotal.USD).toBe(1000);

      // Year 2: Different share counts lead to different dividends
      // Bullish has fewer shares (109), bearish has more (111)
      expect(bullishResult[YEAR_2].yearTotal.USD).toBeLessThan(
        bearishResult[YEAR_2].yearTotal.USD
      );
    });

    it('should default to flat prices when no growth rate specified', () => {
      const stocks = [baseStock];

      const defaultResult = calculateProjection(stocks);
      const explicitFlatResult = calculateProjection(stocks, 0);

      expect(defaultResult[YEAR_1].endOfYearShares).toEqual(
        explicitFlatResult[YEAR_1].endOfYearShares
      );
      expect(defaultResult[YEAR_2].endOfYearShares).toEqual(
        explicitFlatResult[YEAR_2].endOfYearShares
      );
      expect(defaultResult[YEAR_3].endOfYearShares).toEqual(
        explicitFlatResult[YEAR_3].endOfYearShares
      );
    });
  });
});
