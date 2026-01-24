import type { StockWithDividends } from './types';
import { convertToUSD } from './exchangeRates';

export interface StockValue {
  ticker: string;
  name: string;
  shares: number;
  priceUSD: number;
  valueUSD: number;
  percent: number;
}

export interface PortfolioValue {
  totalUSD: number;
  stocks: StockValue[];
}

/**
 * Calculate current portfolio value from analyzed stocks
 * Converts all values to USD for consistent display
 */
export function calculatePortfolioValue(stocks: StockWithDividends[]): PortfolioValue {
  if (stocks.length === 0) {
    return { totalUSD: 0, stocks: [] };
  }

  // Calculate value for each stock in USD
  const stockValues: StockValue[] = stocks.map((stock) => {
    const valueInOriginal = stock.initialShares * stock.currentPrice;
    const valueUSD = convertToUSD(valueInOriginal, stock.currency);
    const priceUSD = convertToUSD(stock.currentPrice, stock.currency);

    return {
      ticker: stock.ticker,
      name: stock.name,
      shares: stock.initialShares,
      priceUSD,
      valueUSD,
      percent: 0, // Will be calculated after we have total
    };
  });

  // Calculate total
  const totalUSD = stockValues.reduce((sum, s) => sum + s.valueUSD, 0);

  // Calculate percentages
  if (totalUSD > 0) {
    for (const stock of stockValues) {
      stock.percent = (stock.valueUSD / totalUSD) * 100;
    }
  }

  // Sort by value descending
  stockValues.sort((a, b) => b.valueUSD - a.valueUSD);

  return { totalUSD, stocks: stockValues };
}

/**
 * Calculate portfolio value at end of year using DRIP share counts
 * Uses current prices (not future prices) to show DRIP accumulation effect
 */
export function calculateYearEndValue(
  stocks: StockWithDividends[],
  endOfYearShares: Record<string, number>
): number {
  let totalUSD = 0;

  for (const stock of stocks) {
    const shares = endOfYearShares[stock.ticker] ?? stock.initialShares;
    const valueInOriginal = shares * stock.currentPrice;
    totalUSD += convertToUSD(valueInOriginal, stock.currency);
  }

  return totalUSD;
}
