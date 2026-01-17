import { DIVIDEND_STOCKS, SuggestedStock } from './dividendStockData';

export interface SuggestedStockWithCoverage extends SuggestedStock {
  coveredMonths: number[]; // Which of the low months this stock covers
}

/**
 * Suggests stocks that pay dividends in the specified low months.
 * Filters out stocks already in the portfolio and sorts by coverage.
 */
export function suggestStocks(
  lowMonths: number[],
  existingTickers: string[],
  maxResults: number = 5
): SuggestedStockWithCoverage[] {
  if (lowMonths.length === 0) {
    return [];
  }

  // Normalize existing tickers to uppercase for comparison
  const existingTickersUpper = new Set(
    existingTickers.map((t) => t.toUpperCase())
  );

  // Filter stocks that:
  // 1. Are not already in portfolio
  // 2. Pay dividends in at least one of the low months
  const candidates = DIVIDEND_STOCKS.filter((stock) => {
    if (existingTickersUpper.has(stock.ticker.toUpperCase())) {
      return false;
    }
    return stock.typicalMonths.some((month) => lowMonths.includes(month));
  });

  // Calculate coverage for each candidate
  const withCoverage: SuggestedStockWithCoverage[] = candidates.map((stock) => ({
    ...stock,
    coveredMonths: stock.typicalMonths.filter((month) =>
      lowMonths.includes(month)
    ),
  }));

  // Sort by coverage (most low months covered first)
  withCoverage.sort((a, b) => b.coveredMonths.length - a.coveredMonths.length);

  return withCoverage.slice(0, maxResults);
}
