import yahooFinance from 'yahoo-finance2';
import type { DividendPayment } from './types';

/**
 * Fetches dividend history for a single ticker from Yahoo Finance
 * Returns dividends from the last 12 months
 */
export async function fetchDividends(
  ticker: string
): Promise<{ dividends: DividendPayment[]; error?: string }> {
  try {
    // Calculate date range (last 12 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Fetch historical data from Yahoo Finance
    const queryOptions = {
      period1: startDate,
      period2: endDate,
      events: 'dividends' as const,
    };

    const result = await yahooFinance.historical(ticker, queryOptions);

    // Filter to only dividend events and map to our format
    const dividends: DividendPayment[] = result
      .filter((item) => 'dividends' in item && item.dividends)
      .map((item) => ({
        date: item.date,
        amount: item.dividends!,
      }));

    // If no dividends found in the last 12 months, return empty array
    if (dividends.length === 0) {
      return {
        dividends: [],
        error: 'No dividend history found in the last 12 months',
      };
    }

    return { dividends };
  } catch (error) {
    // Handle various error types
    if (error instanceof Error) {
      // Check for common Yahoo Finance errors
      if (error.message.includes('Not Found')) {
        return {
          dividends: [],
          error: `Ticker "${ticker}" not found`,
        };
      }
      if (error.message.includes('Invalid')) {
        return {
          dividends: [],
          error: `Invalid ticker symbol: ${ticker}`,
        };
      }
      return {
        dividends: [],
        error: `Failed to fetch dividends: ${error.message}`,
      };
    }

    return {
      dividends: [],
      error: 'Unknown error occurred while fetching dividends',
    };
  }
}
