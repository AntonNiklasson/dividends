import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDividends, fetchBatchDividends } from '@/lib/fetchDividends';
import type { PortfolioStock } from '@/lib/types';

// Hoist mock functions so they're available before module loading
const { mockHistoricalFn, mockQuoteFn } = vi.hoisted(() => ({
  mockHistoricalFn: vi.fn(),
  mockQuoteFn: vi.fn(),
}));

// Mock yahoo-finance2 v3 (requires instantiation)
vi.mock('yahoo-finance2', () => ({
  default: class YahooFinance {
    historical = mockHistoricalFn;
    quote = mockQuoteFn;
  },
}));

// Type aliases for mock responses
type HistoricalResponse = { date: Date; dividends?: number }[];
type QuoteResponse = { regularMarketPrice?: number };

describe('fetchDividends', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('successful fetch', () => {
    it('should fetch dividends and current price for a valid ticker', async () => {
      // Mock historical dividend data
      const mockDividends = [
        { date: new Date('2025-11-15'), dividends: 0.24 },
        { date: new Date('2025-08-15'), dividends: 0.24 },
        { date: new Date('2025-05-15'), dividends: 0.24 },
        { date: new Date('2025-02-15'), dividends: 0.24 },
      ];

      // Mock current price data
      const mockQuote = { regularMarketPrice: 185.5 };

      mockHistoricalFn.mockResolvedValue(
        mockDividends as unknown as HistoricalResponse
      );
      mockQuoteFn.mockResolvedValue(
        mockQuote as unknown as QuoteResponse
      );

      const result = await fetchDividends('AAPL');

      expect(result.dividends).toHaveLength(4);
      expect(result.dividends[0]).toEqual({
        date: new Date('2025-11-15'),
        amount: 0.24,
      });
      expect(result.currentPrice).toBe(185.5);
      expect(result.error).toBeUndefined();
    });

    it('should handle stocks with partial dividend data', async () => {
      const mockDividends = [{ date: new Date('2025-06-15'), dividends: 1.5 }];

      const mockQuote = { regularMarketPrice: 45.2 };

      mockHistoricalFn.mockResolvedValue(
        mockDividends as unknown as HistoricalResponse
      );
      mockQuoteFn.mockResolvedValue(
        mockQuote as unknown as QuoteResponse
      );

      const result = await fetchDividends('XYZ');

      expect(result.dividends).toHaveLength(1);
      expect(result.currentPrice).toBe(45.2);
      expect(result.error).toBeUndefined();
    });
  });

  describe('stocks with no dividends', () => {
    it('should return error message when no dividends found in last 12 months', async () => {
      // Mock empty dividend history
      mockHistoricalFn.mockResolvedValue(
        [] as unknown as HistoricalResponse
      );
      mockQuoteFn.mockResolvedValue({
        regularMarketPrice: 250.0,
      } as unknown as QuoteResponse);

      const result = await fetchDividends('TSLA');

      expect(result.dividends).toHaveLength(0);
      expect(result.currentPrice).toBe(250.0);
      expect(result.error).toBe(
        'No dividend history found in the last 12 months'
      );
    });

    it('should filter out non-dividend events', async () => {
      // Mock data with some items that don't have dividends field
      const mockData = [
        { date: new Date('2025-11-15'), dividends: 0.24 },
        { date: new Date('2025-10-15'), splits: 2 }, // Stock split, not dividend
        { date: new Date('2025-08-15'), dividends: 0.24 },
      ];

      mockHistoricalFn.mockResolvedValue(
        mockData as unknown as HistoricalResponse
      );
      mockQuoteFn.mockResolvedValue({
        regularMarketPrice: 185.5,
      } as unknown as QuoteResponse);

      const result = await fetchDividends('AAPL');

      expect(result.dividends).toHaveLength(2);
      expect(result.dividends.every((d) => d.amount > 0)).toBe(true);
    });
  });

  describe('ticker not found', () => {
    it('should return error when ticker is not found', async () => {
      mockHistoricalFn.mockRejectedValue(
        new Error('Not Found: No data found for ticker')
      );

      const result = await fetchDividends('INVALID');

      expect(result.dividends).toHaveLength(0);
      expect(result.currentPrice).toBeUndefined();
      expect(result.error).toBe('Ticker "INVALID" not found');
    });

    it('should handle invalid ticker symbol error', async () => {
      mockHistoricalFn.mockRejectedValue(
        new Error('Invalid ticker symbol')
      );

      const result = await fetchDividends('123ABC');

      expect(result.dividends).toHaveLength(0);
      expect(result.error).toBe('Invalid ticker symbol: 123ABC');
    });
  });

  describe('network errors', () => {
    it('should handle network errors gracefully', async () => {
      mockHistoricalFn.mockRejectedValue(
        new Error('Network timeout')
      );

      const result = await fetchDividends('AAPL');

      expect(result.dividends).toHaveLength(0);
      expect(result.error).toBe('Failed to fetch dividends: Network timeout');
    });

    it('should handle unknown error types', async () => {
      mockHistoricalFn.mockRejectedValue('Unknown error');

      const result = await fetchDividends('AAPL');

      expect(result.dividends).toHaveLength(0);
      expect(result.error).toBe(
        'Unknown error occurred while fetching dividends'
      );
    });
  });

  describe('current price errors', () => {
    it('should return dividend data even if price fetch fails', async () => {
      const mockDividends = [{ date: new Date('2025-11-15'), dividends: 0.24 }];

      mockHistoricalFn.mockResolvedValue(
        mockDividends as unknown as HistoricalResponse
      );
      mockQuoteFn.mockRejectedValue(
        new Error('Failed to fetch price')
      );

      const result = await fetchDividends('AAPL');

      expect(result.dividends).toHaveLength(1);
      expect(result.currentPrice).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle missing regularMarketPrice in quote response', async () => {
      const mockDividends = [{ date: new Date('2025-11-15'), dividends: 0.24 }];

      mockHistoricalFn.mockResolvedValue(
        mockDividends as unknown as HistoricalResponse
      );
      mockQuoteFn.mockResolvedValue(
        {} as unknown as QuoteResponse
      );

      const result = await fetchDividends('AAPL');

      expect(result.dividends).toHaveLength(1);
      expect(result.currentPrice).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });
});

describe('fetchBatchDividends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful batch processing', () => {
    it('should fetch data for multiple stocks successfully', async () => {
      const stocks: PortfolioStock[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          shares: 50,
          currency: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
        },
        {
          ticker: 'MSFT',
          name: 'Microsoft',
          shares: 30,
          currency: 'USD',
          isin: 'US5949181045',
          type: 'STOCK',
        },
      ];

      // Mock successful responses for both tickers
      mockHistoricalFn
        .mockResolvedValueOnce([
          { date: new Date('2025-11-15'), dividends: 0.24 },
        ] as unknown as HistoricalResponse)
        .mockResolvedValueOnce([
          { date: new Date('2025-11-15'), dividends: 0.75 },
        ] as unknown as HistoricalResponse);

      mockQuoteFn
        .mockResolvedValueOnce({
          regularMarketPrice: 185.5,
        } as unknown as QuoteResponse)
        .mockResolvedValueOnce({
          regularMarketPrice: 425.3,
        } as unknown as QuoteResponse);

      const result = await fetchBatchDividends(stocks);

      expect(result.successfulStocks).toHaveLength(2);
      expect(result.errors).toHaveLength(0);

      expect(result.successfulStocks[0].ticker).toBe('AAPL');
      expect(result.successfulStocks[0].hasDividends).toBe(true);
      expect(result.successfulStocks[0].currentPrice).toBe(185.5);

      expect(result.successfulStocks[1].ticker).toBe('MSFT');
      expect(result.successfulStocks[1].hasDividends).toBe(true);
      expect(result.successfulStocks[1].currentPrice).toBe(425.3);
    });

    it('should convert dividend dates to schedule entries', async () => {
      const stocks: PortfolioStock[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          shares: 50,
          currency: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
        },
      ];

      mockHistoricalFn.mockResolvedValue([
        { date: new Date('2025-11-15'), dividends: 0.24 },
        { date: new Date('2025-08-01'), dividends: 0.24 },
      ] as unknown as HistoricalResponse);

      mockQuoteFn.mockResolvedValue({
        regularMarketPrice: 185.5,
      } as unknown as QuoteResponse);

      const result = await fetchBatchDividends(stocks);

      expect(result.successfulStocks[0].dividendSchedule).toHaveLength(2);
      expect(result.successfulStocks[0].dividendSchedule[0]).toEqual({
        month: 11,
        day: 15,
        amount: 0.24,
      });
      expect(result.successfulStocks[0].dividendSchedule[1]).toEqual({
        month: 8,
        day: 1,
        amount: 0.24,
      });
    });
  });

  describe('partial failures', () => {
    it('should handle mix of valid and invalid tickers', async () => {
      const stocks: PortfolioStock[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          shares: 50,
          currency: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
        },
        {
          ticker: 'INVALID',
          name: 'Invalid Stock',
          shares: 10,
          currency: 'USD',
          isin: '',
          type: 'STOCK',
        },
      ];

      mockHistoricalFn
        .mockResolvedValueOnce([
          { date: new Date('2025-11-15'), dividends: 0.24 },
        ] as unknown as HistoricalResponse)
        .mockRejectedValueOnce(
          new Error('Not Found: No data found for ticker')
        );

      mockQuoteFn.mockResolvedValueOnce({
        regularMarketPrice: 185.5,
      } as unknown as QuoteResponse);

      const result = await fetchBatchDividends(stocks);

      expect(result.successfulStocks).toHaveLength(1);
      expect(result.successfulStocks[0].ticker).toBe('AAPL');

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        ticker: 'INVALID',
        error: 'Ticker "INVALID" not found',
      });
    });

    it('should include stocks with no dividends as successful with flag', async () => {
      const stocks: PortfolioStock[] = [
        {
          ticker: 'TSLA',
          name: 'Tesla',
          shares: 20,
          currency: 'USD',
          isin: 'US88160R1014',
          type: 'STOCK',
        },
      ];

      mockHistoricalFn.mockResolvedValue(
        [] as unknown as HistoricalResponse
      );
      mockQuoteFn.mockResolvedValue({
        regularMarketPrice: 250.0,
      } as unknown as QuoteResponse);

      const result = await fetchBatchDividends(stocks);

      expect(result.successfulStocks).toHaveLength(1);
      expect(result.successfulStocks[0].ticker).toBe('TSLA');
      expect(result.successfulStocks[0].hasDividends).toBe(false);
      expect(result.successfulStocks[0].dividendSchedule).toHaveLength(0);
      expect(result.successfulStocks[0].currentPrice).toBe(250.0);

      expect(result.errors).toHaveLength(0);
    });

    it('should return error when current price is missing for dividend stock', async () => {
      const stocks: PortfolioStock[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          shares: 50,
          currency: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
        },
      ];

      mockHistoricalFn.mockResolvedValue([
        { date: new Date('2025-11-15'), dividends: 0.24 },
      ] as unknown as HistoricalResponse);
      mockQuoteFn.mockResolvedValue(
        {} as unknown as QuoteResponse
      );

      const result = await fetchBatchDividends(stocks);

      expect(result.successfulStocks).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        ticker: 'AAPL',
        error: 'Could not fetch current price (needed for DRIP calculations)',
      });
    });
  });

  describe('parallel processing', () => {
    it('should process multiple stocks in parallel', async () => {
      const stocks: PortfolioStock[] = [
        {
          ticker: 'AAPL',
          name: 'Apple',
          shares: 50,
          currency: 'USD',
          isin: 'US0378331005',
          type: 'STOCK',
        },
        {
          ticker: 'MSFT',
          name: 'Microsoft',
          shares: 30,
          currency: 'USD',
          isin: 'US5949181045',
          type: 'STOCK',
        },
        {
          ticker: 'GOOGL',
          name: 'Alphabet',
          shares: 20,
          currency: 'USD',
          isin: 'US02079K3059',
          type: 'STOCK',
        },
      ];

      // Mock responses for all three tickers
      mockHistoricalFn
        .mockResolvedValueOnce([
          { date: new Date('2025-11-15'), dividends: 0.24 },
        ] as unknown as HistoricalResponse)
        .mockResolvedValueOnce([
          { date: new Date('2025-11-15'), dividends: 0.75 },
        ] as unknown as HistoricalResponse)
        .mockResolvedValueOnce([] as unknown as HistoricalResponse);

      mockQuoteFn
        .mockResolvedValueOnce({
          regularMarketPrice: 185.5,
        } as unknown as QuoteResponse)
        .mockResolvedValueOnce({
          regularMarketPrice: 425.3,
        } as unknown as QuoteResponse)
        .mockResolvedValueOnce({
          regularMarketPrice: 140.2,
        } as unknown as QuoteResponse);

      const result = await fetchBatchDividends(stocks);

      expect(result.successfulStocks).toHaveLength(3);
      expect(result.errors).toHaveLength(0);

      // Verify all three were processed
      const tickers = result.successfulStocks.map((s) => s.ticker).sort();
      expect(tickers).toEqual(['AAPL', 'GOOGL', 'MSFT']);
    });
  });
});
