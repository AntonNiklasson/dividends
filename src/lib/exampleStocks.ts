import type { PersistedStock } from '@/lib/types';

export interface ExampleStock {
  ticker: string;
  name: string;
  currency: string;
}

// Pool of ~60 well-known, recognizable stocks from multiple countries
export const EXAMPLE_STOCKS: ExampleStock[] = [
  // US Stocks - Tech (~10)
  { ticker: 'AAPL', name: 'Apple Inc', currency: 'USD' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', currency: 'USD' },
  { ticker: 'GOOGL', name: 'Alphabet Inc', currency: 'USD' },
  { ticker: 'AMZN', name: 'Amazon.com Inc', currency: 'USD' },
  { ticker: 'META', name: 'Meta Platforms Inc', currency: 'USD' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', currency: 'USD' },
  { ticker: 'TSLA', name: 'Tesla Inc', currency: 'USD' },
  { ticker: 'NFLX', name: 'Netflix Inc', currency: 'USD' },
  { ticker: 'CRM', name: 'Salesforce Inc', currency: 'USD' },
  { ticker: 'ORCL', name: 'Oracle Corporation', currency: 'USD' },

  // US Stocks - Consumer (~8)
  { ticker: 'KO', name: 'Coca-Cola Company', currency: 'USD' },
  { ticker: 'PEP', name: 'PepsiCo Inc', currency: 'USD' },
  { ticker: 'MCD', name: "McDonald's Corporation", currency: 'USD' },
  { ticker: 'WMT', name: 'Walmart Inc', currency: 'USD' },
  { ticker: 'HD', name: 'Home Depot Inc', currency: 'USD' },
  { ticker: 'NKE', name: 'Nike Inc', currency: 'USD' },
  { ticker: 'SBUX', name: 'Starbucks Corporation', currency: 'USD' },
  { ticker: 'DIS', name: 'Walt Disney Company', currency: 'USD' },

  // US Stocks - Healthcare (~4)
  { ticker: 'JNJ', name: 'Johnson & Johnson', currency: 'USD' },
  { ticker: 'PFE', name: 'Pfizer Inc', currency: 'USD' },
  { ticker: 'UNH', name: 'UnitedHealth Group', currency: 'USD' },
  { ticker: 'ABBV', name: 'AbbVie Inc', currency: 'USD' },

  // US Stocks - Finance (~4)
  { ticker: 'JPM', name: 'JPMorgan Chase & Co', currency: 'USD' },
  { ticker: 'V', name: 'Visa Inc', currency: 'USD' },
  { ticker: 'MA', name: 'Mastercard Inc', currency: 'USD' },
  { ticker: 'BRK-B', name: 'Berkshire Hathaway Inc', currency: 'USD' },

  // US Stocks - Other (~2)
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', currency: 'USD' },
  { ticker: 'CVX', name: 'Chevron Corporation', currency: 'USD' },

  // Switzerland (~3)
  { ticker: 'NESN.SW', name: 'Nestlé SA', currency: 'CHF' },
  { ticker: 'NOVN.SW', name: 'Novartis AG', currency: 'CHF' },
  { ticker: 'ROG.SW', name: 'Roche Holding AG', currency: 'CHF' },

  // Sweden (~5)
  { ticker: 'VOLV-B.ST', name: 'Volvo B', currency: 'SEK' },
  { ticker: 'ERIC-B.ST', name: 'Ericsson B', currency: 'SEK' },
  { ticker: 'HM-B.ST', name: 'H&M B', currency: 'SEK' },
  { ticker: 'INVE-B.ST', name: 'Investor B', currency: 'SEK' },
  { ticker: 'SEB-A.ST', name: 'SEB A', currency: 'SEK' },

  // UK (~5)
  { ticker: 'SHEL.L', name: 'Shell plc', currency: 'GBP' },
  { ticker: 'AZN.L', name: 'AstraZeneca plc', currency: 'GBP' },
  { ticker: 'HSBA.L', name: 'HSBC Holdings plc', currency: 'GBP' },
  { ticker: 'BP.L', name: 'BP plc', currency: 'GBP' },
  { ticker: 'ULVR.L', name: 'Unilever plc', currency: 'GBP' },

  // Germany (~4)
  { ticker: 'SAP.DE', name: 'SAP SE', currency: 'EUR' },
  { ticker: 'SIE.DE', name: 'Siemens AG', currency: 'EUR' },
  { ticker: 'BMW.DE', name: 'BMW AG', currency: 'EUR' },
  { ticker: 'VOW3.DE', name: 'Volkswagen AG', currency: 'EUR' },

  // France (~3)
  { ticker: 'MC.PA', name: 'LVMH', currency: 'EUR' },
  { ticker: 'OR.PA', name: "L'Oréal SA", currency: 'EUR' },
  { ticker: 'TTE.PA', name: 'TotalEnergies SE', currency: 'EUR' },

  // Japan (~4)
  { ticker: '7203.T', name: 'Toyota Motor Corporation', currency: 'JPY' },
  { ticker: '6758.T', name: 'Sony Group Corporation', currency: 'JPY' },
  { ticker: '9984.T', name: 'SoftBank Group Corp', currency: 'JPY' },
  { ticker: '6861.T', name: 'Keyence Corporation', currency: 'JPY' },

  // Hong Kong (~3)
  { ticker: '0700.HK', name: 'Tencent Holdings Ltd', currency: 'HKD' },
  { ticker: '9988.HK', name: 'Alibaba Group Holding Ltd', currency: 'HKD' },
  { ticker: '1299.HK', name: 'AIA Group Ltd', currency: 'HKD' },

  // Australia (~3)
  { ticker: 'BHP.AX', name: 'BHP Group Ltd', currency: 'AUD' },
  { ticker: 'CBA.AX', name: 'Commonwealth Bank of Australia', currency: 'AUD' },
  { ticker: 'CSL.AX', name: 'CSL Ltd', currency: 'AUD' },

  // South Korea (~2)
  { ticker: '005930.KS', name: 'Samsung Electronics Co Ltd', currency: 'KRW' },
  { ticker: '000660.KS', name: 'SK Hynix Inc', currency: 'KRW' },

  // India (~3)
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Ltd', currency: 'INR' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services Ltd', currency: 'INR' },
  { ticker: 'INFY.NS', name: 'Infosys Ltd', currency: 'INR' },
];

/**
 * Fisher-Yates shuffle algorithm for randomizing an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a random selection of example stocks
 * @param min Minimum number of stocks to return
 * @param max Maximum number of stocks to return
 * @param exclude Tickers to exclude (e.g., already in portfolio)
 * @returns Array of PersistedStock with random shares (10-50)
 */
export function getRandomExampleStocks(
  min: number,
  max: number,
  exclude: string[] = []
): PersistedStock[] {
  const excludeSet = new Set(exclude.map((t) => t.toUpperCase()));
  const available = EXAMPLE_STOCKS.filter(
    (s) => !excludeSet.has(s.ticker.toUpperCase())
  );

  if (available.length === 0) {
    return [];
  }

  // Determine how many stocks to pick (random between min and max)
  const count = Math.min(
    available.length,
    Math.floor(Math.random() * (max - min + 1)) + min
  );

  // Shuffle and take the first 'count' stocks
  const shuffled = shuffleArray(available);
  const selected = shuffled.slice(0, count);

  // Convert to PersistedStock format
  return selected.map((stock) => ({
    ticker: stock.ticker,
    name: stock.name,
    shares: Math.floor(Math.random() * 41) + 10, // Random 10-50
    currency: stock.currency,
  }));
}
