import yahooFinance from 'yahoo-finance2';
import type { DividendPayment } from './types';

/**
 * Fetches dividend history and current stock price for a single ticker from Yahoo Finance
 * Returns dividends from the last 12 months and the current price
 */
export async function fetchDividends(ticker: string): Promise<{
  dividends: DividendPayment[];
  currentPrice?: number;
  error?: string;
}> {
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

    // Fetch current stock price using quote endpoint
    let currentPrice: number | undefined;
    try {
      const quote = await yahooFinance.quote(ticker);
      currentPrice = quote.regularMarketPrice;
    } catch (priceError) {
      // If we can't get the price, we'll return undefined
      // This is a non-fatal error - we can still return dividend data
      console.warn(`Failed to fetch current price for ${ticker}:`, priceError);
    }

    // If no dividends found in the last 12 months, return empty array
    if (dividends.length === 0) {
      return {
        dividends: [],
        currentPrice,
        error: 'No dividend history found in the last 12 months',
      };
    }

    return { dividends, currentPrice };
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
