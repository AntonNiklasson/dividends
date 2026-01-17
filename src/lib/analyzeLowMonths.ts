import { ProjectionResponse } from './types';

export interface LowMonthsAnalysis {
  lowMonths: number[]; // 1-12 array of months below average
  average: number; // Average monthly dividend for first year
}

/**
 * Analyzes a projection to identify months with below-average dividend income.
 * Uses the first year's data to calculate the average and identify low months.
 */
export function analyzeLowMonths(projection: ProjectionResponse): LowMonthsAnalysis {
  const years = Object.keys(projection).map(Number).sort((a, b) => a - b);

  // Handle empty projection
  if (years.length === 0) {
    return {
      lowMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      average: 0,
    };
  }

  const firstYear = projection[years[0]];
  const monthlyTotals = firstYear.months.map((m) => m.total.USD ?? 0);

  const yearTotal = monthlyTotals.reduce((sum, t) => sum + t, 0);
  const average = yearTotal / 12;

  // If no dividends at all, all months are considered low
  if (yearTotal === 0) {
    return {
      lowMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      average: 0,
    };
  }

  // Find months below average (including zero-dividend months)
  const lowMonths = monthlyTotals
    .map((total, index) => ({ month: index + 1, total }))
    .filter(({ total }) => total < average)
    .map(({ month }) => month);

  return {
    lowMonths,
    average,
  };
}
