import {
  StockWithDividends,
  ProjectionResponse,
  YearProjection,
  MonthProjection,
  ProjectedPayment,
} from './types';

/**
 * Calculate dividend projections for 2026 without DRIP reinvestment
 */
export function calculateProjection(
  stocks: StockWithDividends[]
): ProjectionResponse {
  // Initialize projection structure for 2026 only (no DRIP, single year for now)
  const year2026 = projectYear(stocks, 2026);

  return {
    2026: year2026,
    2027: { months: [], yearTotal: {} }, // Placeholder
    2028: { months: [], yearTotal: {} }, // Placeholder
  };
}

/**
 * Project dividends for a single year without DRIP
 */
function projectYear(
  stocks: StockWithDividends[],
  year: number
): YearProjection {
  // Initialize 12 months
  const months: MonthProjection[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: {},
    payments: [],
  }));

  const yearTotal: Record<string, number> = {};

  // Process each stock
  for (const stock of stocks) {
    // Skip stocks with no dividend history
    if (!stock.hasDividends || stock.dividendSchedule.length === 0) {
      continue;
    }

    // Process each dividend in the schedule
    for (const dividend of stock.dividendSchedule) {
      const monthIndex = dividend.month - 1; // Convert to 0-based index

      // Calculate total dividend payment for this stock
      const dividendAmount = stock.initialShares * dividend.amount;

      // Create payment record
      const payment: ProjectedPayment = {
        ticker: stock.ticker,
        amount: dividendAmount,
        currency: stock.currency,
        date: `${year}-${String(dividend.month).padStart(2, '0')}-${String(dividend.day).padStart(2, '0')}`,
        sharesAtPayment: stock.initialShares,
      };

      // Add to month
      months[monthIndex].payments.push(payment);

      // Update month total
      if (!months[monthIndex].total[stock.currency]) {
        months[monthIndex].total[stock.currency] = 0;
      }
      months[monthIndex].total[stock.currency] += dividendAmount;

      // Update year total
      if (!yearTotal[stock.currency]) {
        yearTotal[stock.currency] = 0;
      }
      yearTotal[stock.currency] += dividendAmount;
    }
  }

  return {
    months,
    yearTotal,
  };
}
