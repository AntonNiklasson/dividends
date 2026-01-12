// Avanza CSV row structure
export interface AvanzaRow {
  Kontonummer: string;
  Namn: string;
  Kortnamn: string;
  Volym: string;
  Marknadsvärde: string;
  "GAV (SEK)": string;
  GAV: string;
  Valuta: string;
  Land: string;
  ISIN: string;
  Marknad: string;
  Typ: string;
}

// Portfolio stock after parsing
export interface PortfolioStock {
  ticker: string;
  name: string;
  shares: number;
  currency: string;
  isin: string;
  type: string;
}

// Parsed portfolio structure
export interface ParsedPortfolio {
  stocks: PortfolioStock[];
  errors: string[];
}

// Single dividend payment from historical data
export interface DividendPayment {
  date: Date;
  amount: number; // Amount per share
}

// Dividend schedule entry for projection
export interface DividendScheduleEntry {
  month: number; // 1-12
  day: number; // 1-31
  amount: number; // Dividend per share
}

// Stock with dividend data
export interface StockWithDividends {
  ticker: string;
  name: string;
  initialShares: number;
  currency: string;
  currentPrice: number;
  dividendSchedule: DividendScheduleEntry[];
  hasDividends: boolean; // False if no dividend history found
}

// Error for a specific ticker
export interface TickerError {
  ticker: string;
  error: string;
}

// Single payment in projection
export interface ProjectedPayment {
  ticker: string;
  amount: number;
  currency: string;
  date: string; // ISO format: "YYYY-MM-DD"
  sharesAtPayment: number;
}

// Monthly projection
export interface MonthProjection {
  month: number; // 1-12
  total: Record<string, number>; // Currency -> total amount
  payments: ProjectedPayment[];
}

// Yearly projection
export interface YearProjection {
  months: MonthProjection[];
  yearTotal: Record<string, number>; // Currency -> total amount
}

// Full projection response
export interface ProjectionResponse {
  2026: YearProjection;
  2027: YearProjection;
  2028: YearProjection;
}

// API response structure
export interface AnalyzeResponse {
  success: boolean;
  portfolio?: {
    stocks: StockWithDividends[];
    errors: TickerError[];
  };
  projection?: ProjectionResponse;
  error?: string;
}
