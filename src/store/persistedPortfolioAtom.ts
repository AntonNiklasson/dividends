import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { PersistedPortfolio, PersistedStock, PortfolioCollection } from '@/lib/types';
import { getRandomExampleStocks } from '@/lib/exampleStocks';

const OLD_STORAGE_KEY = 'dividends-portfolio';
const STORAGE_KEY = 'dividends-portfolios';

const DEFAULT_STOCKS: PersistedStock[] = [
  { ticker: 'AAPL', name: 'Apple Inc', shares: 10, currency: 'USD' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', shares: 10, currency: 'USD' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', shares: 10, currency: 'USD' },
  { ticker: 'VOLV-B.ST', name: 'Volvo B', shares: 10, currency: 'SEK' },
];

function generateId(): string {
  return `portfolio-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createDefaultPortfolio(): PersistedPortfolio {
  return {
    id: generateId(),
    name: 'My Portfolio',
    stocks: DEFAULT_STOCKS,
  };
}

function createDefaultCollection(): PortfolioCollection {
  const defaultPortfolio = createDefaultPortfolio();
  return {
    portfolios: [defaultPortfolio],
    activePortfolioId: defaultPortfolio.id,
  };
}

// Migration: convert old single portfolio format to new multi-portfolio format
function migrateFromOldFormat(): PortfolioCollection | null {
  if (typeof window === 'undefined') return null;

  try {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (!oldData) return null;

    const oldPortfolio: PersistedPortfolio = JSON.parse(oldData);

    // Ensure the old portfolio has a valid id
    const portfolio: PersistedPortfolio = {
      id: oldPortfolio.id || generateId(),
      name: oldPortfolio.name || 'My Portfolio',
      stocks: oldPortfolio.stocks || [],
    };

    const collection: PortfolioCollection = {
      portfolios: [portfolio],
      activePortfolioId: portfolio.id,
    };

    // Save to new format and remove old key
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    localStorage.removeItem(OLD_STORAGE_KEY);

    return collection;
  } catch {
    return null;
  }
}

// Custom storage to handle migration (exported for testing)
export const portfolioCollectionStorage = {
  getItem: (key: string, initialValue: PortfolioCollection): PortfolioCollection => {
    if (typeof window === 'undefined') return initialValue;

    try {
      // First check if we have data in the new format
      const newData = localStorage.getItem(key);
      if (newData) {
        return JSON.parse(newData);
      }

      // Try to migrate from old format
      const migrated = migrateFromOldFormat();
      if (migrated) {
        return migrated;
      }

      return initialValue;
    } catch {
      return initialValue;
    }
  },
  setItem: (key: string, value: PortfolioCollection): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// Main collection atom
export const portfolioCollectionAtom = atomWithStorage<PortfolioCollection>(
  STORAGE_KEY,
  createDefaultCollection(),
  portfolioCollectionStorage
);

// Derived atom for the active portfolio
export const activePortfolioAtom = atom(
  (get) => {
    const collection = get(portfolioCollectionAtom);
    const active = collection.portfolios.find(
      (p) => p.id === collection.activePortfolioId
    );
    // Fallback to first portfolio if active not found
    return active || collection.portfolios[0];
  }
);

// Derived atom for all portfolios
export const allPortfoliosAtom = atom((get) => get(portfolioCollectionAtom).portfolios);

// Derived atom for stocks list from active portfolio (backwards compatibility)
export const portfolioStocksAtom = atom((get) => get(activePortfolioAtom).stocks);

// Legacy alias for backwards compatibility
export const persistedPortfolioAtom = activePortfolioAtom;

// Action: Create new portfolio
export const createPortfolioAtom = atom(
  null,
  (get, set, name?: string) => {
    const collection = get(portfolioCollectionAtom);
    const newPortfolio: PersistedPortfolio = {
      id: generateId(),
      name: name || `Portfolio ${collection.portfolios.length + 1}`,
      stocks: [],
    };
    set(portfolioCollectionAtom, {
      portfolios: [...collection.portfolios, newPortfolio],
      activePortfolioId: newPortfolio.id,
    });
    return newPortfolio.id;
  }
);

// Action: Delete portfolio
export const deletePortfolioAtom = atom(
  null,
  (get, set, portfolioId: string) => {
    const collection = get(portfolioCollectionAtom);

    // Prevent deleting the last portfolio
    if (collection.portfolios.length <= 1) {
      return false;
    }

    const newPortfolios = collection.portfolios.filter((p) => p.id !== portfolioId);

    // If we're deleting the active portfolio, switch to the first remaining one
    let newActiveId = collection.activePortfolioId;
    if (portfolioId === collection.activePortfolioId) {
      newActiveId = newPortfolios[0].id;
    }

    set(portfolioCollectionAtom, {
      portfolios: newPortfolios,
      activePortfolioId: newActiveId,
    });
    return true;
  }
);

// Action: Switch portfolio
export const switchPortfolioAtom = atom(
  null,
  (get, set, portfolioId: string) => {
    const collection = get(portfolioCollectionAtom);
    const exists = collection.portfolios.some((p) => p.id === portfolioId);
    if (!exists) return false;

    set(portfolioCollectionAtom, {
      ...collection,
      activePortfolioId: portfolioId,
    });
    return true;
  }
);

// Action: Rename portfolio
export const renamePortfolioAtom = atom(
  null,
  (get, set, { portfolioId, name }: { portfolioId: string; name: string }) => {
    const collection = get(portfolioCollectionAtom);
    set(portfolioCollectionAtom, {
      ...collection,
      portfolios: collection.portfolios.map((p) =>
        p.id === portfolioId ? { ...p, name } : p
      ),
    });
  }
);

// Action: Duplicate portfolio
export const duplicatePortfolioAtom = atom(
  null,
  (get, set, portfolioId: string) => {
    const collection = get(portfolioCollectionAtom);
    const source = collection.portfolios.find((p) => p.id === portfolioId);
    if (!source) return null;

    const newPortfolio: PersistedPortfolio = {
      id: generateId(),
      name: `${source.name} (Copy)`,
      stocks: [...source.stocks],
    };

    set(portfolioCollectionAtom, {
      portfolios: [...collection.portfolios, newPortfolio],
      activePortfolioId: newPortfolio.id,
    });
    return newPortfolio.id;
  }
);

// Action: Add stock to active portfolio
export const addStockAtom = atom(
  null,
  (get, set, stock: PersistedStock) => {
    const collection = get(portfolioCollectionAtom);
    const activePortfolio = collection.portfolios.find(
      (p) => p.id === collection.activePortfolioId
    );
    if (!activePortfolio) return;

    const exists = activePortfolio.stocks.some((s) => s.ticker === stock.ticker);

    set(portfolioCollectionAtom, {
      ...collection,
      portfolios: collection.portfolios.map((p) =>
        p.id === collection.activePortfolioId
          ? {
              ...p,
              stocks: exists
                ? p.stocks.map((s) =>
                    s.ticker === stock.ticker
                      ? { ...s, shares: s.shares + stock.shares }
                      : s
                  )
                : [...p.stocks, stock],
            }
          : p
      ),
    });
  }
);

// Action: Remove stock from active portfolio
export const removeStockAtom = atom(null, (get, set, ticker: string) => {
  const collection = get(portfolioCollectionAtom);
  set(portfolioCollectionAtom, {
    ...collection,
    portfolios: collection.portfolios.map((p) =>
      p.id === collection.activePortfolioId
        ? { ...p, stocks: p.stocks.filter((s) => s.ticker !== ticker) }
        : p
    ),
  });
});

// Action: Update shares in active portfolio
export const updateSharesAtom = atom(
  null,
  (get, set, { ticker, shares }: { ticker: string; shares: number }) => {
    const collection = get(portfolioCollectionAtom);
    set(portfolioCollectionAtom, {
      ...collection,
      portfolios: collection.portfolios.map((p) =>
        p.id === collection.activePortfolioId
          ? {
              ...p,
              stocks: p.stocks.map((s) =>
                s.ticker === ticker ? { ...s, shares } : s
              ),
            }
          : p
      ),
    });
  }
);

// Action: Clear active portfolio
export const clearPortfolioAtom = atom(null, (get, set) => {
  const collection = get(portfolioCollectionAtom);
  set(portfolioCollectionAtom, {
    ...collection,
    portfolios: collection.portfolios.map((p) =>
      p.id === collection.activePortfolioId ? { ...p, stocks: [] } : p
    ),
  });
});

// Action: Add example stocks to active portfolio
export const addExampleStocksAtom = atom(null, (get, set) => {
  const collection = get(portfolioCollectionAtom);
  const activePortfolio = collection.portfolios.find(
    (p) => p.id === collection.activePortfolioId
  );
  if (!activePortfolio) return;

  const existingTickers = activePortfolio.stocks.map((s) => s.ticker);
  const newStocks = getRandomExampleStocks(4, 7, existingTickers);

  set(portfolioCollectionAtom, {
    ...collection,
    portfolios: collection.portfolios.map((p) =>
      p.id === collection.activePortfolioId
        ? { ...p, stocks: [...p.stocks, ...newStocks] }
        : p
    ),
  });
});

// Action: Import stocks to active portfolio (merge with existing)
export const importStocksAtom = atom(null, (get, set, newStocks: PersistedStock[]) => {
  const collection = get(portfolioCollectionAtom);
  const activePortfolio = collection.portfolios.find(
    (p) => p.id === collection.activePortfolioId
  );
  if (!activePortfolio) return;

  const existingTickers = new Set(activePortfolio.stocks.map((s) => s.ticker));
  const merged = [...activePortfolio.stocks];

  for (const stock of newStocks) {
    if (existingTickers.has(stock.ticker)) {
      const idx = merged.findIndex((s) => s.ticker === stock.ticker);
      merged[idx] = { ...merged[idx], shares: stock.shares };
    } else {
      merged.push(stock);
    }
  }

  set(portfolioCollectionAtom, {
    ...collection,
    portfolios: collection.portfolios.map((p) =>
      p.id === collection.activePortfolioId ? { ...p, stocks: merged } : p
    ),
  });
});

// Action: Replace all stocks in active portfolio
export const replaceStocksAtom = atom(null, (get, set, newStocks: PersistedStock[]) => {
  const collection = get(portfolioCollectionAtom);
  set(portfolioCollectionAtom, {
    ...collection,
    portfolios: collection.portfolios.map((p) =>
      p.id === collection.activePortfolioId ? { ...p, stocks: newStocks } : p
    ),
  });
});

// Action: Update frequency info for a stock in active portfolio
export const updateFrequencyAtom = atom(
  null,
  (
    get,
    set,
    { ticker, frequencyInfo }: { ticker: string; frequencyInfo: PersistedStock['frequencyInfo'] }
  ) => {
    const collection = get(portfolioCollectionAtom);
    set(portfolioCollectionAtom, {
      ...collection,
      portfolios: collection.portfolios.map((p) =>
        p.id === collection.activePortfolioId
          ? {
              ...p,
              stocks: p.stocks.map((s) =>
                s.ticker === ticker ? { ...s, frequencyInfo } : s
              ),
            }
          : p
      ),
    });
  }
);

// Action: Import a complete portfolio (for sharing feature)
export const importPortfolioAtom = atom(
  null,
  (get, set, portfolio: PersistedPortfolio) => {
    const collection = get(portfolioCollectionAtom);

    // Check if a portfolio with this name already exists
    const existingNames = collection.portfolios.map((p) => p.name.toLowerCase());
    let name = portfolio.name;
    let counter = 1;
    while (existingNames.includes(name.toLowerCase())) {
      name = `${portfolio.name} (${counter})`;
      counter++;
    }

    const newPortfolio: PersistedPortfolio = {
      id: generateId(),
      name,
      stocks: portfolio.stocks,
    };

    set(portfolioCollectionAtom, {
      portfolios: [...collection.portfolios, newPortfolio],
      activePortfolioId: newPortfolio.id,
    });
    return newPortfolio.id;
  }
);
