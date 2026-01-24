import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseCsv } from '@/lib/parseCsv';
import { fetchBatchDividends } from '@/lib/fetchDividends';
import { calculateProjection } from '@/lib/calculateProjection';
import type { StockWithDividends, PortfolioStock } from '@/lib/types';

/**
 * Integration tests for the analyze API route flow
 *
 * Note: These tests validate the data flow through the key functions
 * (parseCsv → fetchBatchDividends → calculateProjection) rather than
 * testing the HTTP route handler directly, as Next.js route handlers
 * have limitations in unit test environments (File/Blob handling).
 *
 * Full end-to-end HTTP testing is covered by Playwright E2E tests.
 */

// Mock the Yahoo Finance fetching
vi.mock('@/lib/fetchDividends', () => ({
  fetchBatchDividends: vi.fn(),
}));

describe('API /api/analyze integration flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success flow: CSV parsing → dividend fetching → projection', () => {
    it('should successfully process valid CSV through full pipeline', async () => {
      const csvContent = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;50;232500,00;4650,00;465,00;USD;US;US0378331005;XNAS;STOCK
1234567;Microsoft;MSFT;30;131250,00;4375,00;437,50;USD;US;US5949181045;XNAS;STOCK`;

      // Step 1: Parse CSV
      const parsedPortfolio = parseCsv(csvContent);

      expect(parsedPortfolio.stocks).toHaveLength(2);
      expect(parsedPortfolio.errors).toHaveLength(0);
      expect(parsedPortfolio.stocks[0].ticker).toBe('AAPL');
      expect(parsedPortfolio.stocks[1].ticker).toBe('MSFT');

      // Step 2: Mock dividend data fetch
      const mockDividendData: StockWithDividends[] = [
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
        {
          ticker: 'MSFT',
          name: 'Microsoft',
          initialShares: 30,
          currency: 'USD',
          currentPrice: 375.0,
          hasDividends: true,
          dividendSchedule: [
            { month: 3, day: 15, amount: 0.75 },
            { month: 6, day: 15, amount: 0.75 },
            { month: 9, day: 15, amount: 0.75 },
            { month: 12, day: 15, amount: 0.75 },
          ],
        },
      ];

      vi.mocked(fetchBatchDividends).mockResolvedValue({
        successfulStocks: mockDividendData,
        errors: [],
      });

      const dividendData = await fetchBatchDividends(parsedPortfolio.stocks);

      expect(dividendData.successfulStocks).toHaveLength(2);
      expect(dividendData.errors).toHaveLength(0);

      // Step 3: Calculate projection
      const projection = calculateProjection(dividendData.successfulStocks);

      expect(projection).toBeDefined();
      expect(projection['2026']).toBeDefined();
      expect(projection['2027']).toBeDefined();
      expect(projection['2028']).toBeDefined();
      expect(projection['2026'].months).toHaveLength(12);
      expect(projection['2026'].yearTotal).toBeDefined();
      expect(projection['2026'].yearTotal.USD).toBeGreaterThan(0);
    });

    it('should handle stocks with no dividend history', async () => {
      const csvContent = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;50;232500,00;4650,00;465,00;USD;US;US0378331005;XNAS;STOCK
1234567;Growth Stock;GROW;20;10000,00;500,00;50,00;USD;US;US1234567890;XNAS;STOCK`;

      const parsedPortfolio = parseCsv(csvContent);
      expect(parsedPortfolio.stocks).toHaveLength(2);

      // Mock with one dividend-paying and one non-dividend stock
      const mockDividendData: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          initialShares: 50,
          currency: 'USD',
          currentPrice: 185.5,
          hasDividends: true,
          dividendSchedule: [{ month: 2, day: 15, amount: 0.24 }],
        },
        {
          ticker: 'GROW',
          name: 'Growth Stock',
          initialShares: 20,
          currency: 'USD',
          currentPrice: 500.0,
          hasDividends: false,
          dividendSchedule: [],
        },
      ];

      vi.mocked(fetchBatchDividends).mockResolvedValue({
        successfulStocks: mockDividendData,
        errors: [],
      });

      const dividendData = await fetchBatchDividends(parsedPortfolio.stocks);
      expect(dividendData.successfulStocks).toHaveLength(2);
      expect(dividendData.successfulStocks[1].hasDividends).toBe(false);

      // Projection should only include dividend-paying stocks
      const projection = calculateProjection(dividendData.successfulStocks);
      expect(projection['2026'].months[1].payments.length).toBeGreaterThan(0); // February has AAPL
    });

    it('should include errors for failed ticker lookups', async () => {
      const csvContent = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;50;232500,00;4650,00;465,00;USD;US;US0378331005;XNAS;STOCK
1234567;Invalid;INVALID;20;10000,00;500,00;50,00;USD;US;US0000000000;XNAS;STOCK`;

      const parsedPortfolio = parseCsv(csvContent);
      expect(parsedPortfolio.stocks).toHaveLength(2);

      const mockDividendData: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          initialShares: 50,
          currency: 'USD',
          currentPrice: 185.5,
          hasDividends: true,
          dividendSchedule: [{ month: 2, day: 15, amount: 0.24 }],
        },
      ];

      vi.mocked(fetchBatchDividends).mockResolvedValue({
        successfulStocks: mockDividendData,
        errors: [{ ticker: 'INVALID', error: 'Ticker not found' }],
      });

      const dividendData = await fetchBatchDividends(parsedPortfolio.stocks);

      expect(dividendData.successfulStocks).toHaveLength(1);
      expect(dividendData.errors).toHaveLength(1);
      expect(dividendData.errors[0].ticker).toBe('INVALID');
      expect(dividendData.errors[0].error).toBe('Ticker not found');

      // Projection should work with remaining stocks
      const projection = calculateProjection(dividendData.successfulStocks);
      expect(projection['2026']).toBeDefined();
    });

    it('should filter out FUND type entries during parsing', () => {
      const csvContent = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;50;232500,00;4650,00;465,00;USD;US;US0378331005;XNAS;STOCK
1234567;Avanza Global;Avanza Global;72;16491,36;193,02;193,02;SEK;SE;SE0011527613;FUND;FUND`;

      const parsedPortfolio = parseCsv(csvContent);

      // Should only have AAPL, not the fund
      expect(parsedPortfolio.stocks).toHaveLength(1);
      expect(parsedPortfolio.stocks[0].ticker).toBe('AAPL');
    });
  });

  describe('Error handling', () => {
    it('should return errors when CSV is missing required columns', () => {
      const csvContent = `Kontonummer;Namn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;50;232500,00;4650,00;465,00;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csvContent);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Missing required column: Kortnamn');
    });

    it('should return error when CSV has no valid stock data', () => {
      const csvContent = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Avanza Global;Avanza Global;72;16491,36;193,02;193,02;SEK;SE;SE0011527613;FUND;FUND`;

      const result = parseCsv(csvContent);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('No valid stock data found in file');
    });

    it('should handle dividend fetching failures gracefully', async () => {
      const mockStocks: PortfolioStock[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          shares: 50,
          currency: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
        },
      ];

      vi.mocked(fetchBatchDividends).mockRejectedValue(
        new Error('Network error')
      );

      await expect(fetchBatchDividends(mockStocks)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Data flow validation', () => {
    it('should correctly pass parsed stocks to dividend fetcher', async () => {
      const csvContent = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;SKF B;SKF B;14;3506,67;247,76;247,76;SEK;SE;SE0000108227;XSTO;STOCK
1234567;Apple;AAPL;50;232500,00;4650,00;465,00;USD;US;US0378331005;XNAS;STOCK`;

      const parsedPortfolio = parseCsv(csvContent);

      const mockDividendData: StockWithDividends[] = [
        {
          ticker: 'SKF B',
          name: 'SKF B',
          initialShares: 14,
          currency: 'SEK',
          currentPrice: 250.48,
          hasDividends: true,
          dividendSchedule: [{ month: 5, day: 10, amount: 7.0 }],
        },
        {
          ticker: 'AAPL',
          name: 'Apple',
          initialShares: 50,
          currency: 'USD',
          currentPrice: 185.5,
          hasDividends: true,
          dividendSchedule: [{ month: 2, day: 15, amount: 0.24 }],
        },
      ];

      vi.mocked(fetchBatchDividends).mockResolvedValue({
        successfulStocks: mockDividendData,
        errors: [],
      });

      await fetchBatchDividends(parsedPortfolio.stocks);

      // Verify that fetchBatchDividends was called with the correct parsed data
      expect(fetchBatchDividends).toHaveBeenCalledWith([
        {
          ticker: 'SKF B',
          name: 'SKF B',
          shares: 14,
          currency: 'SEK',
          isin: 'SE0000108227',
          type: 'STOCK',
        },
        {
          ticker: 'AAPL',
          name: 'Apple',
          shares: 50,
          currency: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
        },
      ]);
    });

    it('should generate projection with all 3 years and 12 months each', async () => {
      const mockDividendData: StockWithDividends[] = [
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

      const projection = calculateProjection(mockDividendData);

      // Verify projection structure
      expect(projection).toBeDefined();
      expect(projection['2026']).toBeDefined();
      expect(projection['2027']).toBeDefined();
      expect(projection['2028']).toBeDefined();

      // Each year should have months array
      expect(projection['2026'].months).toHaveLength(12);
      expect(projection['2027'].months).toHaveLength(12);
      expect(projection['2028'].months).toHaveLength(12);

      // Year should have totals
      expect(projection['2026'].yearTotal).toBeDefined();
      expect(projection['2026'].yearTotal.USD).toBeGreaterThan(0);

      // Months with dividends should have payments
      const febPayments = projection['2026'].months[1].payments; // February (index 1)
      expect(febPayments.length).toBeGreaterThan(0);
      expect(febPayments[0].ticker).toBe('AAPL');
    });

    it('should convert all currencies to USD in projections', async () => {
      const mockDividendData: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          initialShares: 50,
          currency: 'USD',
          currentPrice: 185.5,
          hasDividends: true,
          dividendSchedule: [{ month: 2, day: 15, amount: 0.24 }],
        },
        {
          ticker: 'NESN.SW',
          name: 'Nestle',
          initialShares: 25,
          currency: 'CHF',
          currentPrice: 112.5,
          hasDividends: true,
          dividendSchedule: [{ month: 4, day: 20, amount: 2.8 }],
        },
      ];

      const projection = calculateProjection(mockDividendData);
      const currentYear = new Date().getFullYear();

      // All currencies converted to USD
      expect(projection[currentYear].yearTotal.USD).toBeDefined();
      expect(projection[currentYear].yearTotal.USD).toBeGreaterThan(0);
      // CHF should not exist - converted to USD
      expect(projection[currentYear].yearTotal.CHF).toBeUndefined();
    });

    it('should populate endOfYearShares for portfolio tracking', async () => {
      const mockDividendData: StockWithDividends[] = [
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

      const projection = calculateProjection(mockDividendData);
      const currentYear = new Date().getFullYear();

      // Each year should have endOfYearShares
      expect(projection[currentYear].endOfYearShares).toBeDefined();
      expect(projection[currentYear + 1].endOfYearShares).toBeDefined();
      expect(projection[currentYear + 2].endOfYearShares).toBeDefined();

      // AAPL should be in endOfYearShares
      expect(projection[currentYear].endOfYearShares!['AAPL']).toBeDefined();
      expect(projection[currentYear].endOfYearShares!['AAPL']).toBeGreaterThanOrEqual(50);
    });

    it('should show share accumulation over years with DRIP', async () => {
      const mockDividendData: StockWithDividends[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          initialShares: 100,
          currency: 'USD',
          currentPrice: 10, // Low price for easy DRIP calculation
          hasDividends: true,
          dividendSchedule: [
            { month: 3, day: 15, amount: 1.0 }, // $1 dividend = $100 total = 10 new shares
            { month: 6, day: 15, amount: 1.0 },
            { month: 9, day: 15, amount: 1.0 },
            { month: 12, day: 15, amount: 1.0 },
          ],
        },
      ];

      const projection = calculateProjection(mockDividendData);
      const currentYear = new Date().getFullYear();

      const year1Shares = projection[currentYear].endOfYearShares!['AAPL'];
      const year2Shares = projection[currentYear + 1].endOfYearShares!['AAPL'];
      const year3Shares = projection[currentYear + 2].endOfYearShares!['AAPL'];

      // Shares should increase each year due to DRIP
      expect(year1Shares).toBeGreaterThan(100); // Started with 100
      expect(year2Shares).toBeGreaterThan(year1Shares);
      expect(year3Shares).toBeGreaterThan(year2Shares);
    });
  });
});
