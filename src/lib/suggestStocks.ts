import { DIVIDEND_STOCKS, SuggestedStock } from './dividendStockData';

export interface SuggestedStockWithCoverage extends SuggestedStock {
  coveredMonths: number[]; // Which of the low months this stock covers
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Suggests stocks that pay dividends in the specified low months.
 * Filters out stocks already in the portfolio and returns a randomized
 * selection that still prefers stocks with better coverage.
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

  // Group by coverage level, shuffle within each group, then flatten
  // This maintains preference for better-covering stocks while adding randomness
  const coverageGroups = new Map<number, SuggestedStockWithCoverage[]>();

  for (const stock of withCoverage) {
    const coverage = stock.coveredMonths.length;
    if (!coverageGroups.has(coverage)) {
      coverageGroups.set(coverage, []);
    }
    coverageGroups.get(coverage)!.push(stock);
  }

  // Sort coverage levels descending and shuffle within each group
  const sortedCoverageLevels = [...coverageGroups.keys()].sort((a, b) => b - a);

  const shuffledResults: SuggestedStockWithCoverage[] = [];
  for (const level of sortedCoverageLevels) {
    const group = coverageGroups.get(level)!;
    shuffledResults.push(...shuffleArray(group));
  }

  return shuffledResults.slice(0, maxResults);
}
