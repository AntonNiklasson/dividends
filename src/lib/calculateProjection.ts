import {
  StockWithDividends,
  ProjectionResponse,
  YearProjection,
  MonthProjection,
  ProjectedPayment,
} from './types';
import { convertToUSD } from './exchangeRates';

/**
 * Calculate dividend projections for current year + next 2 years with DRIP reinvestment
 * @param stocks - Array of stocks with dividend schedules
 * @param annualPriceGrowth - Annual price growth rate (e.g., 0.1 for +10%/year, -0.1 for -10%/year)
 */
export function calculateProjection(
  stocks: StockWithDividends[],
  annualPriceGrowth = 0
): ProjectionResponse {
  // Initialize share tracking for DRIP
  const shareTracker: Map<string, number> = new Map();
  // Track unspent cash per stock (remainder after buying whole shares)
  const cashTracker: Map<string, number> = new Map();
  for (const stock of stocks) {
    shareTracker.set(stock.ticker, stock.initialShares);
    cashTracker.set(stock.ticker, 0);
  }

  // Project dividends for current year + 2 more
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2];

  const result: ProjectionResponse = {};
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const yearIndex = i + 1; // 1, 2, 3 for price growth calculation
    result[year] = projectYear(stocks, year, shareTracker, cashTracker, annualPriceGrowth, yearIndex);
    // Snapshot share counts at end of year
    result[year].endOfYearShares = Object.fromEntries(shareTracker);
  }

  return result;
}

/**
 * Project dividends for a single year with DRIP reinvestment
 * @param annualPriceGrowth - Annual price growth rate (e.g., 0.1 for +10%/year)
 * @param yearIndex - Which year this is (1, 2, 3) for calculating compounded price
 */
function projectYear(
  stocks: StockWithDividends[],
  year: number,
  shareTracker: Map<string, number>,
  cashTracker: Map<string, number>,
  annualPriceGrowth: number,
  yearIndex: number
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
    const dividendAmountOriginal = currentShares * event.amount;
    const dividendAmountUSD = convertToUSD(
      dividendAmountOriginal,
      event.stock.currency
    );

    // Create payment record (all amounts in USD)
    const payment: ProjectedPayment = {
      ticker: event.stock.ticker,
      name: event.stock.name,
      amount: dividendAmountUSD,
      currency: 'USD',
      date: `${year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`,
      sharesAtPayment: currentShares,
    };

    // Add to month
    months[monthIndex].payments.push(payment);

    // Update month total (single USD total)
    if (!months[monthIndex].total.USD) {
      months[monthIndex].total.USD = 0;
    }
    months[monthIndex].total.USD += dividendAmountUSD;

    // Update year total
    if (!yearTotal.USD) {
      yearTotal.USD = 0;
    }
    yearTotal.USD += dividendAmountUSD;

    // DRIP: Calculate new shares purchased with dividend (in original currency)
    // Only buy whole shares, track remainder cash for future reinvestment
    // Apply price growth: price = basePrice * (1 + growth)^yearIndex
    const adjustedPrice =
      event.stock.currentPrice * Math.pow(1 + annualPriceGrowth, yearIndex);
    const currentCash = cashTracker.get(event.stock.ticker) || 0;
    const totalCash = currentCash + dividendAmountOriginal;
    const newShares = Math.floor(totalCash / adjustedPrice);
    const remainderCash = totalCash - newShares * adjustedPrice;

    shareTracker.set(event.stock.ticker, currentShares + newShares);
    cashTracker.set(event.stock.ticker, remainderCash);
  }

  return {
    months,
    yearTotal,
  };
}
