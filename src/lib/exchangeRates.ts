// Approximate exchange rates to USD (as of early 2026)
// These are hardcoded for MVP - could fetch at build time later
export const EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  SEK: 0.095, // ~10.5 SEK per USD
  EUR: 1.08,
  GBP: 1.27,
  CHF: 1.12,
  NOK: 0.091,
  DKK: 0.145,
  CAD: 0.74,
  AUD: 0.65,
  JPY: 0.0067,
};

export function convertToUSD(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES_TO_USD[currency] ?? 1;
  return amount * rate;
}
