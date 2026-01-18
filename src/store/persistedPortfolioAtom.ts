import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { PersistedPortfolio, PersistedStock } from '@/lib/types';
import { getRandomExampleStocks } from '@/lib/exampleStocks';

const STORAGE_KEY = 'dividends-portfolio';

const DEFAULT_STOCKS: PersistedStock[] = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10, currency: 'USD' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', shares: 10, currency: 'USD' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', shares: 10, currency: 'USD' },
  { ticker: 'VOLV-B.ST', name: 'Volvo B', shares: 10, currency: 'SEK' },
];

const DEFAULT_PORTFOLIO: PersistedPortfolio = {
  id: 'default',
  name: 'My Portfolio',
  stocks: DEFAULT_STOCKS,
};

export const persistedPortfolioAtom = atomWithStorage<PersistedPortfolio>(
  STORAGE_KEY,
  DEFAULT_PORTFOLIO
);

// Derived atom for stocks list
export const portfolioStocksAtom = atom((get) => get(persistedPortfolioAtom).stocks);

// Action: Add stock
export const addStockAtom = atom(
  null,
  (get, set, stock: PersistedStock) => {
    const portfolio = get(persistedPortfolioAtom);
    const exists = portfolio.stocks.some((s) => s.ticker === stock.ticker);
    if (exists) {
      // Update shares if stock exists
      set(persistedPortfolioAtom, {
        ...portfolio,
        stocks: portfolio.stocks.map((s) =>
          s.ticker === stock.ticker ? { ...s, shares: s.shares + stock.shares } : s
        ),
      });
    } else {
      set(persistedPortfolioAtom, {
        ...portfolio,
        stocks: [...portfolio.stocks, stock],
      });
    }
  }
);

// Action: Remove stock
export const removeStockAtom = atom(null, (get, set, ticker: string) => {
  const portfolio = get(persistedPortfolioAtom);
  set(persistedPortfolioAtom, {
    ...portfolio,
    stocks: portfolio.stocks.filter((s) => s.ticker !== ticker),
  });
});

// Action: Update shares
export const updateSharesAtom = atom(
  null,
  (get, set, { ticker, shares }: { ticker: string; shares: number }) => {
    const portfolio = get(persistedPortfolioAtom);
    set(persistedPortfolioAtom, {
      ...portfolio,
      stocks: portfolio.stocks.map((s) => (s.ticker === ticker ? { ...s, shares } : s)),
    });
  }
);

// Action: Clear portfolio
export const clearPortfolioAtom = atom(null, (get, set) => {
  const portfolio = get(persistedPortfolioAtom);
  set(persistedPortfolioAtom, {
    ...portfolio,
    stocks: [],
  });
});

// Action: Add example stocks (4-7 random stocks from the pool)
export const addExampleStocksAtom = atom(null, (get, set) => {
  const portfolio = get(persistedPortfolioAtom);
  const existingTickers = portfolio.stocks.map((s) => s.ticker);

  const newStocks = getRandomExampleStocks(4, 7, existingTickers);
  set(persistedPortfolioAtom, {
    ...portfolio,
    stocks: [...portfolio.stocks, ...newStocks],
  });
});

// Action: Import stocks from CSV (merge with existing)
export const importStocksAtom = atom(null, (get, set, newStocks: PersistedStock[]) => {
  const portfolio = get(persistedPortfolioAtom);
  const existingTickers = new Set(portfolio.stocks.map((s) => s.ticker));

  const merged = [...portfolio.stocks];
  for (const stock of newStocks) {
    if (existingTickers.has(stock.ticker)) {
      // Update existing
      const idx = merged.findIndex((s) => s.ticker === stock.ticker);
      merged[idx] = { ...merged[idx], shares: stock.shares };
    } else {
      merged.push(stock);
    }
  }

  set(persistedPortfolioAtom, {
    ...portfolio,
    stocks: merged,
  });
});

// Action: Replace all stocks with imported ones
export const replaceStocksAtom = atom(null, (get, set, newStocks: PersistedStock[]) => {
  const portfolio = get(persistedPortfolioAtom);
  set(persistedPortfolioAtom, {
    ...portfolio,
    stocks: newStocks,
  });
});

// Action: Update frequency info for a stock
export const updateFrequencyAtom = atom(
  null,
  (get, set, { ticker, frequencyInfo }: { ticker: string; frequencyInfo: PersistedStock['frequencyInfo'] }) => {
    const portfolio = get(persistedPortfolioAtom);
    set(persistedPortfolioAtom, {
      ...portfolio,
      stocks: portfolio.stocks.map((s) =>
        s.ticker === ticker ? { ...s, frequencyInfo } : s
      ),
    });
  }
);
