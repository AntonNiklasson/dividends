import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Portfolio Value Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display stock prices after loading', async ({ page }) => {
    // Mock the dividend-info API to return deterministic prices
    await page.route('/api/dividend-info*', async (route) => {
      const url = new URL(route.request().url());
      const ticker = url.searchParams.get('ticker');

      const prices: Record<string, number> = {
        AAPL: 185.5,
        MSFT: 375.0,
        NVDA: 450.0,
        'VOLV-B.ST': 265.0,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ticker,
          frequencyInfo: { frequency: 'quarterly', months: [2, 5, 8, 11] },
          hasDividends: true,
          currentPrice: prices[ticker || ''] || 100,
        }),
      });
    });

    await page.goto('/');

    // Wait for prices to load (default portfolio has stocks)
    // Prices should appear next to tickers
    await expect(page.getByText('$185.50').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display total portfolio value in header', async ({ page }) => {
    // Mock API with known prices for the default portfolio
    await page.route('/api/dividend-info*', async (route) => {
      const url = new URL(route.request().url());
      const ticker = url.searchParams.get('ticker');

      const prices: Record<string, number> = {
        AAPL: 100.0,  // 10 shares * $100 = $1000
        MSFT: 200.0,  // 10 shares * $200 = $2000
        NVDA: 300.0,  // 10 shares * $300 = $3000
        'VOLV-B.ST': 100.0, // 10 shares * 100 SEK * 0.095 = $95
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ticker,
          frequencyInfo: { frequency: 'quarterly', months: [2, 5, 8, 11] },
          hasDividends: true,
          currentPrice: prices[ticker || ''] || 100,
        }),
      });
    });

    await page.goto('/');

    // Total should be approximately $6,095 (6000 USD + 95 from SEK conversion)
    // Wait for total to appear in the header - should show dollar amount with comma
    // The total value appears in a p.text-lg.font-semibold inside the CardHeader
    await expect(page.locator('p.text-lg.font-semibold').first()).toBeVisible({ timeout: 10000 });

    // Verify it contains a dollar amount
    const headerText = await page.locator('p.text-lg.font-semibold').first().textContent();
    expect(headerText).toMatch(/\$[0-9,]+\.[0-9]{2}/);
  });

  test('should show position value next to shares', async ({ page }) => {
    await page.route('/api/dividend-info*', async (route) => {
      const url = new URL(route.request().url());
      const ticker = url.searchParams.get('ticker');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ticker,
          frequencyInfo: { frequency: 'quarterly', months: [2, 5, 8, 11] },
          hasDividends: true,
          currentPrice: ticker === 'AAPL' ? 100.0 : 200.0,
        }),
      });
    });

    await page.goto('/');

    // Position values should appear (shares * price)
    // AAPL: 10 shares * $100 = $1,000.00
    await expect(page.getByText('$1,000.00').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Results Page Portfolio Summary', () => {
  test('should display portfolio summary after analysis', async ({ page }) => {
    // This requires mocking both dividend-info and analyze-portfolio APIs
    await page.route('/api/dividend-info*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ticker: 'AAPL',
          frequencyInfo: { frequency: 'quarterly', months: [2, 5, 8, 11] },
          hasDividends: true,
          currentPrice: 185.5,
        }),
      });
    });

    await page.route('/api/analyze-portfolio', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          portfolio: {
            stocks: [
              {
                ticker: 'AAPL',
                name: 'Apple Inc',
                initialShares: 10,
                currency: 'USD',
                currentPrice: 185.5,
                hasDividends: true,
                dividendSchedule: [
                  { month: 2, day: 15, amount: 0.24 },
                  { month: 5, day: 15, amount: 0.24 },
                  { month: 8, day: 15, amount: 0.24 },
                  { month: 11, day: 15, amount: 0.24 },
                ],
              },
            ],
            errors: [],
          },
          projection: {
            2026: {
              months: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: { USD: i === 1 || i === 4 || i === 7 || i === 10 ? 2.4 : 0 },
                payments: [],
              })),
              yearTotal: { USD: 9.6 },
              endOfYearShares: { AAPL: 10 },
            },
            2027: {
              months: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: { USD: i === 1 || i === 4 || i === 7 || i === 10 ? 2.4 : 0 },
                payments: [],
              })),
              yearTotal: { USD: 9.6 },
              endOfYearShares: { AAPL: 10 },
            },
            2028: {
              months: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: { USD: i === 1 || i === 4 || i === 7 || i === 10 ? 2.4 : 0 },
                payments: [],
              })),
              yearTotal: { USD: 9.6 },
              endOfYearShares: { AAPL: 10 },
            },
          },
        }),
      });
    });

    // Set up a simple portfolio
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dividends-portfolios',
        JSON.stringify({
          portfolios: [
            {
              id: 'test-portfolio',
              name: 'Test Portfolio',
              stocks: [
                { ticker: 'AAPL', name: 'Apple Inc', shares: 10, currency: 'USD' },
              ],
            },
          ],
          activePortfolioId: 'test-portfolio',
        })
      );
    });
    await page.reload();

    // Click analyze
    await page.getByRole('button', { name: /Analyze Dividends/i }).click();

    // Wait for results page
    await expect(page.getByRole('heading', { name: 'Dividend Projection' })).toBeVisible({ timeout: 10000 });

    // Portfolio Summary should be visible
    await expect(page.getByText('Portfolio Value')).toBeVisible();

    // Total value should be shown ($1,855.00 = 10 shares * $185.50)
    // Use .first() as the value appears in both summary header and table
    await expect(page.getByText('$1,855.00').first()).toBeVisible();

    // Stock table should show AAPL
    await expect(page.getByText('AAPL').first()).toBeVisible();
  });

  test('should display portfolio growth chart', async ({ page }) => {
    await page.route('/api/dividend-info*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ticker: 'AAPL',
          frequencyInfo: { frequency: 'quarterly', months: [2, 5, 8, 11] },
          hasDividends: true,
          currentPrice: 185.5,
        }),
      });
    });

    await page.route('/api/analyze-portfolio', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          portfolio: {
            stocks: [
              {
                ticker: 'AAPL',
                name: 'Apple Inc',
                initialShares: 10,
                currency: 'USD',
                currentPrice: 185.5,
                hasDividends: true,
                dividendSchedule: [],
              },
            ],
            errors: [],
          },
          projection: {
            2026: {
              months: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: { USD: 0 },
                payments: [],
              })),
              yearTotal: { USD: 0 },
              endOfYearShares: { AAPL: 11 },
            },
            2027: {
              months: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: { USD: 0 },
                payments: [],
              })),
              yearTotal: { USD: 0 },
              endOfYearShares: { AAPL: 12 },
            },
            2028: {
              months: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: { USD: 0 },
                payments: [],
              })),
              yearTotal: { USD: 0 },
              endOfYearShares: { AAPL: 13 },
            },
          },
        }),
      });
    });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dividends-portfolios',
        JSON.stringify({
          portfolios: [
            {
              id: 'test-portfolio',
              name: 'Test Portfolio',
              stocks: [
                { ticker: 'AAPL', name: 'Apple Inc', shares: 10, currency: 'USD' },
              ],
            },
          ],
          activePortfolioId: 'test-portfolio',
        })
      );
    });
    await page.reload();

    await page.getByRole('button', { name: /Analyze Dividends/i }).click();

    await expect(page.getByRole('heading', { name: 'Dividend Projection' })).toBeVisible({ timeout: 10000 });

    // Growth chart should be visible
    await expect(page.getByText('Portfolio Growth Scenarios')).toBeVisible();

    // Legend should show scenario labels
    await expect(page.getByText('+10%/year')).toBeVisible();
  });
});
