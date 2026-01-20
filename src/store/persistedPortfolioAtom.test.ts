import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing the module
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

describe('Portfolio Migration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should migrate old single portfolio format to new collection format', async () => {
    // Set up old format data
    const oldPortfolio = {
      id: 'old-portfolio-id',
      name: 'My Old Portfolio',
      stocks: [
        { ticker: 'AAPL', name: 'Apple Inc', shares: 10, currency: 'USD' },
        { ticker: 'MSFT', name: 'Microsoft', shares: 5, currency: 'USD' },
      ],
    };
    localStorageMock.setItem('dividends-portfolio', JSON.stringify(oldPortfolio));

    // Import and get the storage handler
    const { portfolioCollectionStorage } = await import('./persistedPortfolioAtom');

    // The getItem should perform migration
    const result = portfolioCollectionStorage.getItem('dividends-portfolios', {
      portfolios: [],
      activePortfolioId: '',
    });

    expect(result.portfolios).toHaveLength(1);
    expect(result.portfolios[0].name).toBe('My Old Portfolio');
    expect(result.portfolios[0].stocks).toHaveLength(2);
    expect(result.activePortfolioId).toBe(result.portfolios[0].id);
  });

  it('should use existing collection format if available', async () => {
    // Set up new format data
    const collection = {
      portfolios: [
        {
          id: 'portfolio-1',
          name: 'Portfolio 1',
          stocks: [{ ticker: 'AAPL', name: 'Apple', shares: 10, currency: 'USD' }],
        },
        {
          id: 'portfolio-2',
          name: 'Portfolio 2',
          stocks: [],
        },
      ],
      activePortfolioId: 'portfolio-2',
    };
    localStorageMock.setItem('dividends-portfolios', JSON.stringify(collection));

    const { portfolioCollectionStorage } = await import('./persistedPortfolioAtom');

    const result = portfolioCollectionStorage.getItem('dividends-portfolios', {
      portfolios: [],
      activePortfolioId: '',
    });

    expect(result.portfolios).toHaveLength(2);
    expect(result.activePortfolioId).toBe('portfolio-2');
  });

  it('should return default collection if no data exists', async () => {
    const { portfolioCollectionStorage } = await import('./persistedPortfolioAtom');

    const defaultCollection = {
      portfolios: [{ id: 'default', name: 'Default', stocks: [] }],
      activePortfolioId: 'default',
    };

    const result = portfolioCollectionStorage.getItem('dividends-portfolios', defaultCollection);

    // Should return the initial value since nothing is in localStorage
    expect(result).toEqual(defaultCollection);
  });
});

describe('Portfolio Collection Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should serialize and save collection to localStorage', async () => {
    const { portfolioCollectionStorage } = await import('./persistedPortfolioAtom');

    const collection = {
      portfolios: [
        {
          id: 'test-portfolio',
          name: 'Test Portfolio',
          stocks: [{ ticker: 'AAPL', name: 'Apple', shares: 10, currency: 'USD' }],
        },
      ],
      activePortfolioId: 'test-portfolio',
    };

    portfolioCollectionStorage.setItem('dividends-portfolios', collection);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dividends-portfolios',
      JSON.stringify(collection)
    );
  });
});

// Export the storage handler for testing
export { localStorageMock };
