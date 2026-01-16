import YahooFinance from 'yahoo-finance2';
import type {
  DividendPayment,
  PortfolioStock,
  StockWithDividends,
  TickerError,
  DividendScheduleEntry,
} from './types';
import { cache, CACHE_KEYS } from './cache';
import { detectFrequency } from './dividendFrequency';

// Yahoo Finance types (incomplete, using what we need)
interface YahooHistoricalDividendRow {
  date: Date;
  dividends: number;
}

interface YahooQuote {
  regularMarketPrice?: number;
  longName?: string;
  shortName?: string;
}

// Cached dividend data structure (dates stored as ISO strings for serialization)
interface CachedDividendData {
  dividends: Array<{ date: string; amount: number }>;
  currentPrice?: number;
  name?: string;
  error?: string;
  cachedAt: number;
}

// Cache TTL: 24 hours for dividend data
const DIVIDEND_CACHE_TTL = 24 * 60 * 60;

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

/**
 * Fetches dividend history and current stock price for a single ticker from Yahoo Finance
 * Returns dividends from the last 12 months and the current price
 *
 * Results are cached for 24 hours to reduce API calls
 */
export async function fetchDividends(ticker: string): Promise<{
  dividends: DividendPayment[];
  currentPrice?: number;
  name?: string;
  error?: string;
}> {
  const cacheKey = `${CACHE_KEYS.DIVIDEND_DATA}${ticker.toUpperCase()}`;

  // Check cache first
  const cached = await cache.get<CachedDividendData>(cacheKey);
  if (cached) {
    // Convert cached date strings back to Date objects
    return {
      dividends: cached.dividends.map((d) => ({
        date: new Date(d.date),
        amount: d.amount,
      })),
      currentPrice: cached.currentPrice,
      name: cached.name,
      error: cached.error,
    };
  }

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

    const result = (await yahooFinance.historical(
      ticker,
      queryOptions
    )) as YahooHistoricalDividendRow[];

    // Filter to only dividend events and map to our format
    const dividends: DividendPayment[] = result
      .filter(
        (item): item is YahooHistoricalDividendRow =>
          'dividends' in item && !!item.dividends
      )
      .map((item) => ({
        date: item.date,
        amount: item.dividends,
      }));

    // Fetch current stock price and name using quote endpoint
    let currentPrice: number | undefined;
    let name: string | undefined;
    try {
      const quote = (await yahooFinance.quote(ticker)) as YahooQuote;
      currentPrice = quote.regularMarketPrice;
      name = quote.longName || quote.shortName || ticker;
    } catch (priceError) {
      // If we can't get the price, we'll return undefined
      // This is a non-fatal error - we can still return dividend data
      console.warn(`Failed to fetch current price for ${ticker}:`, priceError);
    }

    // Prepare result
    let fetchResult: {
      dividends: DividendPayment[];
      currentPrice?: number;
      name?: string;
      error?: string;
    };

    // If no dividends found in the last 12 months, return empty array
    if (dividends.length === 0) {
      fetchResult = {
        dividends: [],
        currentPrice,
        name,
        error: 'No dividend history found in the last 12 months',
      };
    } else {
      fetchResult = { dividends, currentPrice, name };
    }

    // Cache the result (convert dates to ISO strings for serialization)
    const cacheData: CachedDividendData = {
      dividends: fetchResult.dividends.map((d) => ({
        date: d.date.toISOString(),
        amount: d.amount,
      })),
      currentPrice: fetchResult.currentPrice,
      name: fetchResult.name,
      error: fetchResult.error,
      cachedAt: Date.now(),
    };
    await cache.set(cacheKey, cacheData, DIVIDEND_CACHE_TTL);

    return fetchResult;
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

/**
 * Converts DividendPayment[] to DividendScheduleEntry[]
 * Extracts month, day, and amount from the historical dividend data
 */
function convertToSchedule(
  dividends: DividendPayment[]
): DividendScheduleEntry[] {
  return dividends.map((div) => ({
    month: div.date.getMonth() + 1, // getMonth() returns 0-11, we want 1-12
    day: div.date.getDate(),
    amount: div.amount,
  }));
}

/**
 * Fetches dividend data for multiple tickers
 * Handles partial failures - continues processing even if some tickers fail
 * Returns successful stocks and errors separately
 */
export async function fetchBatchDividends(stocks: PortfolioStock[]): Promise<{
  successfulStocks: StockWithDividends[];
  errors: TickerError[];
}> {
  const successfulStocks: StockWithDividends[] = [];
  const errors: TickerError[] = [];

  // Process all tickers in parallel
  await Promise.all(
    stocks.map(async (stock) => {
      const result = await fetchDividends(stock.ticker);

      // Handle stocks with errors
      if (
        result.error &&
        result.dividends.length === 0 &&
        !result.currentPrice
      ) {
        // Fatal error - couldn't fetch ticker at all
        errors.push({
          ticker: stock.ticker,
          error: result.error,
        });
        return;
      }

      // Handle stocks with no dividend history but valid ticker
      if (
        result.dividends.length === 0 ||
        result.error?.includes('No dividend history')
      ) {
        // Valid ticker but no dividends - still include with flag
        successfulStocks.push({
          ticker: stock.ticker,
          name: result.name || stock.ticker,
          initialShares: stock.shares,
          currency: stock.currency,
          currentPrice: result.currentPrice || 0,
          dividendSchedule: [],
          hasDividends: false,
          frequencyInfo: { frequency: 'irregular', months: [] },
        });
        return;
      }

      // Handle missing current price
      if (!result.currentPrice) {
        errors.push({
          ticker: stock.ticker,
          error: 'Could not fetch current price (needed for DRIP calculations)',
        });
        return;
      }

      // Success case - ticker found with dividends and price
      successfulStocks.push({
        ticker: stock.ticker,
        name: result.name || stock.ticker,
        initialShares: stock.shares,
        currency: stock.currency,
        currentPrice: result.currentPrice,
        dividendSchedule: convertToSchedule(result.dividends),
        hasDividends: true,
        frequencyInfo: detectFrequency(result.dividends),
      });
    })
  );

  return {
    successfulStocks,
    errors,
  };
}
