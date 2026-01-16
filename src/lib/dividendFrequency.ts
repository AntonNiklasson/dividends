import type {
  DividendPayment,
  DividendFrequency,
  FrequencyInfo,
} from './types';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Detects dividend payout frequency from historical payments
 * Returns frequency type and typical payout months
 */
export function detectFrequency(dividends: DividendPayment[]): FrequencyInfo {
  if (dividends.length === 0) {
    return { frequency: 'irregular', months: [] };
  }

  // Extract unique months from dividend payments
  const months = [...new Set(dividends.map((d) => d.date.getMonth() + 1))].sort(
    (a, b) => a - b
  );

  const paymentCount = dividends.length;

  // Determine frequency based on payment count in 12-month window
  let frequency: DividendFrequency;
  if (paymentCount >= 10) {
    frequency = 'monthly';
  } else if (paymentCount >= 3 && paymentCount <= 5) {
    frequency = 'quarterly';
  } else if (paymentCount === 2) {
    frequency = 'semi-annual';
  } else if (paymentCount === 1) {
    frequency = 'annual';
  } else {
    frequency = 'irregular';
  }

  return { frequency, months };
}

/**
 * Formats frequency info as a display string
 * e.g., "Feb, May, Aug, Nov"
 */
export function formatFrequency(info: FrequencyInfo): string {
  if (info.months.length === 0) {
    return '';
  }

  const monthNames = info.months.map((m) => MONTH_NAMES[m - 1]);
  return monthNames.join(', ');
}
