export interface SuggestedStock {
  ticker: string;
  name: string;
  typicalMonths: number[]; // 1-12 array of payment months
  sector: string;
}

/**
 * Curated list of dividend-paying stocks with their typical payment months.
 * Includes dividend aristocrats, REITs, utilities, consumer staples, financials, healthcare, and tech.
 * Payment months are based on historical patterns and may vary slightly.
 */
export const DIVIDEND_STOCKS: SuggestedStock[] = [
  // === DIVIDEND ARISTOCRATS & KINGS ===
  // Quarterly payers (Jan/Apr/Jul/Oct pattern)
  { ticker: 'JNJ', name: 'Johnson & Johnson', typicalMonths: [3, 6, 9, 12], sector: 'Healthcare' },
  { ticker: 'PG', name: 'Procter & Gamble', typicalMonths: [2, 5, 8, 11], sector: 'Consumer Staples' },
  { ticker: 'KO', name: 'Coca-Cola', typicalMonths: [4, 7, 10, 1], sector: 'Consumer Staples' },
  { ticker: 'PEP', name: 'PepsiCo', typicalMonths: [1, 3, 6, 9], sector: 'Consumer Staples' },
  { ticker: 'MMM', name: '3M Company', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },
  { ticker: 'ABT', name: 'Abbott Laboratories', typicalMonths: [2, 5, 8, 11], sector: 'Healthcare' },
  { ticker: 'ABBV', name: 'AbbVie', typicalMonths: [2, 5, 8, 11], sector: 'Healthcare' },
  { ticker: 'CL', name: 'Colgate-Palmolive', typicalMonths: [2, 5, 8, 11], sector: 'Consumer Staples' },
  { ticker: 'CLX', name: 'Clorox', typicalMonths: [2, 5, 8, 11], sector: 'Consumer Staples' },
  { ticker: 'KMB', name: 'Kimberly-Clark', typicalMonths: [1, 4, 7, 10], sector: 'Consumer Staples' },
  { ticker: 'MCD', name: "McDonald's", typicalMonths: [3, 6, 9, 12], sector: 'Consumer Discretionary' },
  { ticker: 'WMT', name: 'Walmart', typicalMonths: [1, 4, 6, 9], sector: 'Consumer Staples' },
  { ticker: 'HD', name: 'Home Depot', typicalMonths: [3, 6, 9, 12], sector: 'Consumer Discretionary' },
  { ticker: 'LOW', name: "Lowe's", typicalMonths: [2, 5, 8, 11], sector: 'Consumer Discretionary' },
  { ticker: 'TGT', name: 'Target', typicalMonths: [3, 6, 9, 12], sector: 'Consumer Discretionary' },
  { ticker: 'SYY', name: 'Sysco', typicalMonths: [1, 4, 7, 10], sector: 'Consumer Staples' },
  { ticker: 'HRL', name: 'Hormel Foods', typicalMonths: [2, 5, 8, 11], sector: 'Consumer Staples' },
  { ticker: 'GIS', name: 'General Mills', typicalMonths: [2, 5, 8, 11], sector: 'Consumer Staples' },
  { ticker: 'K', name: 'Kellanova', typicalMonths: [3, 6, 9, 12], sector: 'Consumer Staples' },
  { ticker: 'CAT', name: 'Caterpillar', typicalMonths: [2, 5, 8, 11], sector: 'Industrials' },

  // === TECHNOLOGY ===
  { ticker: 'AAPL', name: 'Apple', typicalMonths: [2, 5, 8, 11], sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft', typicalMonths: [3, 6, 9, 12], sector: 'Technology' },
  { ticker: 'CSCO', name: 'Cisco Systems', typicalMonths: [1, 4, 7, 10], sector: 'Technology' },
  { ticker: 'INTC', name: 'Intel', typicalMonths: [3, 6, 9, 12], sector: 'Technology' },
  { ticker: 'IBM', name: 'IBM', typicalMonths: [3, 6, 9, 12], sector: 'Technology' },
  { ticker: 'TXN', name: 'Texas Instruments', typicalMonths: [2, 5, 8, 11], sector: 'Technology' },
  { ticker: 'AVGO', name: 'Broadcom', typicalMonths: [3, 6, 9, 12], sector: 'Technology' },
  { ticker: 'QCOM', name: 'Qualcomm', typicalMonths: [3, 6, 9, 12], sector: 'Technology' },

  // === FINANCIALS ===
  { ticker: 'JPM', name: 'JPMorgan Chase', typicalMonths: [1, 4, 7, 10], sector: 'Financials' },
  { ticker: 'BAC', name: 'Bank of America', typicalMonths: [3, 6, 9, 12], sector: 'Financials' },
  { ticker: 'WFC', name: 'Wells Fargo', typicalMonths: [3, 6, 9, 12], sector: 'Financials' },
  { ticker: 'C', name: 'Citigroup', typicalMonths: [2, 5, 8, 11], sector: 'Financials' },
  { ticker: 'GS', name: 'Goldman Sachs', typicalMonths: [3, 6, 9, 12], sector: 'Financials' },
  { ticker: 'MS', name: 'Morgan Stanley', typicalMonths: [2, 5, 8, 11], sector: 'Financials' },
  { ticker: 'BLK', name: 'BlackRock', typicalMonths: [3, 6, 9, 12], sector: 'Financials' },
  { ticker: 'SCHW', name: 'Charles Schwab', typicalMonths: [2, 5, 8, 11], sector: 'Financials' },
  { ticker: 'USB', name: 'U.S. Bancorp', typicalMonths: [1, 4, 7, 10], sector: 'Financials' },
  { ticker: 'PNC', name: 'PNC Financial', typicalMonths: [2, 5, 8, 11], sector: 'Financials' },
  { ticker: 'TFC', name: 'Truist Financial', typicalMonths: [3, 6, 9, 12], sector: 'Financials' },

  // === UTILITIES ===
  { ticker: 'NEE', name: 'NextEra Energy', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'DUK', name: 'Duke Energy', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'SO', name: 'Southern Company', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'D', name: 'Dominion Energy', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'AEP', name: 'American Electric Power', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'XEL', name: 'Xcel Energy', typicalMonths: [1, 4, 7, 10], sector: 'Utilities' },
  { ticker: 'ED', name: 'Consolidated Edison', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'EXC', name: 'Exelon', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'WEC', name: 'WEC Energy', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },
  { ticker: 'ES', name: 'Eversource Energy', typicalMonths: [3, 6, 9, 12], sector: 'Utilities' },

  // === HEALTHCARE ===
  { ticker: 'UNH', name: 'UnitedHealth Group', typicalMonths: [3, 6, 9, 12], sector: 'Healthcare' },
  { ticker: 'PFE', name: 'Pfizer', typicalMonths: [3, 6, 9, 12], sector: 'Healthcare' },
  { ticker: 'MRK', name: 'Merck', typicalMonths: [1, 4, 7, 10], sector: 'Healthcare' },
  { ticker: 'LLY', name: 'Eli Lilly', typicalMonths: [3, 6, 9, 12], sector: 'Healthcare' },
  { ticker: 'BMY', name: 'Bristol-Myers Squibb', typicalMonths: [2, 5, 8, 11], sector: 'Healthcare' },
  { ticker: 'AMGN', name: 'Amgen', typicalMonths: [3, 6, 9, 12], sector: 'Healthcare' },
  { ticker: 'GILD', name: 'Gilead Sciences', typicalMonths: [3, 6, 9, 12], sector: 'Healthcare' },
  { ticker: 'CVS', name: 'CVS Health', typicalMonths: [2, 5, 8, 11], sector: 'Healthcare' },
  { ticker: 'MDT', name: 'Medtronic', typicalMonths: [1, 4, 7, 10], sector: 'Healthcare' },

  // === ENERGY ===
  { ticker: 'XOM', name: 'Exxon Mobil', typicalMonths: [3, 6, 9, 12], sector: 'Energy' },
  { ticker: 'CVX', name: 'Chevron', typicalMonths: [3, 6, 9, 12], sector: 'Energy' },
  { ticker: 'COP', name: 'ConocoPhillips', typicalMonths: [3, 6, 9, 12], sector: 'Energy' },
  { ticker: 'EOG', name: 'EOG Resources', typicalMonths: [1, 4, 7, 10], sector: 'Energy' },
  { ticker: 'SLB', name: 'Schlumberger', typicalMonths: [1, 4, 7, 10], sector: 'Energy' },
  { ticker: 'PSX', name: 'Phillips 66', typicalMonths: [3, 6, 9, 12], sector: 'Energy' },
  { ticker: 'VLO', name: 'Valero Energy', typicalMonths: [3, 6, 9, 12], sector: 'Energy' },
  { ticker: 'MPC', name: 'Marathon Petroleum', typicalMonths: [3, 6, 9, 12], sector: 'Energy' },

  // === REITS (Real Estate Investment Trusts) ===
  { ticker: 'O', name: 'Realty Income', typicalMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], sector: 'REIT' },
  { ticker: 'STAG', name: 'STAG Industrial', typicalMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], sector: 'REIT' },
  { ticker: 'MAIN', name: 'Main Street Capital', typicalMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], sector: 'REIT' },
  { ticker: 'SPG', name: 'Simon Property Group', typicalMonths: [3, 6, 9, 12], sector: 'REIT' },
  { ticker: 'AMT', name: 'American Tower', typicalMonths: [1, 4, 7, 10], sector: 'REIT' },
  { ticker: 'PLD', name: 'Prologis', typicalMonths: [3, 6, 9, 12], sector: 'REIT' },
  { ticker: 'EQIX', name: 'Equinix', typicalMonths: [3, 6, 9, 12], sector: 'REIT' },
  { ticker: 'DLR', name: 'Digital Realty', typicalMonths: [3, 6, 9, 12], sector: 'REIT' },
  { ticker: 'AVB', name: 'AvalonBay Communities', typicalMonths: [1, 4, 7, 10], sector: 'REIT' },
  { ticker: 'EQR', name: 'Equity Residential', typicalMonths: [1, 4, 7, 10], sector: 'REIT' },
  { ticker: 'VTR', name: 'Ventas', typicalMonths: [1, 4, 7, 10], sector: 'REIT' },
  { ticker: 'WELL', name: 'Welltower', typicalMonths: [2, 5, 8, 11], sector: 'REIT' },
  { ticker: 'ARE', name: 'Alexandria Real Estate', typicalMonths: [1, 4, 7, 10], sector: 'REIT' },

  // === INDUSTRIALS ===
  { ticker: 'UNP', name: 'Union Pacific', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },
  { ticker: 'UPS', name: 'United Parcel Service', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },
  { ticker: 'HON', name: 'Honeywell', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },
  { ticker: 'RTX', name: 'RTX Corporation', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },
  { ticker: 'LMT', name: 'Lockheed Martin', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },
  { ticker: 'GD', name: 'General Dynamics', typicalMonths: [2, 5, 8, 11], sector: 'Industrials' },
  { ticker: 'DE', name: 'Deere & Company', typicalMonths: [2, 5, 8, 11], sector: 'Industrials' },
  { ticker: 'EMR', name: 'Emerson Electric', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },
  { ticker: 'ITW', name: 'Illinois Tool Works', typicalMonths: [1, 4, 7, 10], sector: 'Industrials' },
  { ticker: 'SWK', name: 'Stanley Black & Decker', typicalMonths: [3, 6, 9, 12], sector: 'Industrials' },

  // === COMMUNICATION SERVICES ===
  { ticker: 'VZ', name: 'Verizon', typicalMonths: [2, 5, 8, 11], sector: 'Communication Services' },
  { ticker: 'T', name: 'AT&T', typicalMonths: [2, 5, 8, 11], sector: 'Communication Services' },
  { ticker: 'CMCSA', name: 'Comcast', typicalMonths: [1, 4, 7, 10], sector: 'Communication Services' },
];

/**
 * Get all unique sectors from the dividend stocks
 */
export function getSectors(): string[] {
  return [...new Set(DIVIDEND_STOCKS.map((s) => s.sector))];
}

/**
 * Get stocks that pay dividends in specific months
 */
export function getStocksByMonths(months: number[]): SuggestedStock[] {
  return DIVIDEND_STOCKS.filter((stock) =>
    months.some((month) => stock.typicalMonths.includes(month))
  );
}
