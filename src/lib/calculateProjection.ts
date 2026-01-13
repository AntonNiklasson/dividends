import {
  StockWithDividends,
  ProjectionResponse,
  YearProjection,
  MonthProjection,
  ProjectedPayment,
} from './types';

/**
 * Calculate dividend projections for 2026-2028 with DRIP reinvestment
 */
export function calculateProjection(
  stocks: StockWithDividends[]
): ProjectionResponse {
  // Initialize share tracking for DRIP
  const shareTracker: Map<string, number> = new Map();
  for (const stock of stocks) {
    shareTracker.set(stock.ticker, stock.initialShares);
  }

  // Project dividends for 3 years with DRIP
  const year2026 = projectYear(stocks, 2026, shareTracker);
  const year2027 = projectYear(stocks, 2027, shareTracker);
  const year2028 = projectYear(stocks, 2028, shareTracker);

  return {
    2026: year2026,
    2027: year2027,
    2028: year2028,
  };
}

/**
 * Project dividends for a single year with DRIP reinvestment
 */
function projectYear(
  stocks: StockWithDividends[],
  year: number,
  shareTracker: Map<string, number>
): YearProjection {
  // Initialize 12 months
  const months: MonthProjection[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: {},
    payments: [],
  }));

  const yearTotal: Record<string, number> = {};

  // Create an array of all dividend events with stock reference, sorted by date
  interface DividendEvent {
    stock: StockWithDividends;
    month: number;
    day: number;
    amount: number;
  }

  const dividendEvents: DividendEvent[] = [];

  for (const stock of stocks) {
    // Skip stocks with no dividend history
    if (!stock.hasDividends || stock.dividendSchedule.length === 0) {
      continue;
    }

    // Create events for each dividend in the schedule
    for (const dividend of stock.dividendSchedule) {
      dividendEvents.push({
        stock,
        month: dividend.month,
        day: dividend.day,
        amount: dividend.amount,
      });
    }
  }

  // Sort events by date (month first, then day)
  dividendEvents.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  // Process each dividend event in chronological order
  for (const event of dividendEvents) {
    const currentShares = shareTracker.get(event.stock.ticker) || 0;
    const monthIndex = event.month - 1; // Convert to 0-based index

    // Calculate total dividend payment for this stock at current share count
    const dividendAmount = currentShares * event.amount;

    // Create payment record
    const payment: ProjectedPayment = {
      ticker: event.stock.ticker,
      name: event.stock.name,
      amount: dividendAmount,
      currency: event.stock.currency,
      date: `${year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`,
      sharesAtPayment: currentShares,
    };

    // Add to month
    months[monthIndex].payments.push(payment);

    // Update month total
    if (!months[monthIndex].total[event.stock.currency]) {
      months[monthIndex].total[event.stock.currency] = 0;
    }
    months[monthIndex].total[event.stock.currency] += dividendAmount;

    // Update year total
    if (!yearTotal[event.stock.currency]) {
      yearTotal[event.stock.currency] = 0;
    }
    yearTotal[event.stock.currency] += dividendAmount;

    // DRIP: Calculate new shares purchased with dividend
    const newShares = dividendAmount / event.stock.currentPrice;
    shareTracker.set(event.stock.ticker, currentShares + newShares);
  }

  return {
    months,
    yearTotal,
  };
}
