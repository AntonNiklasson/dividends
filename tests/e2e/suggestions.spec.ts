import { test, expect } from '@playwright/test';

test.describe('Stock Suggestions', () => {
  // Helper to add stocks and analyze
  async function setupPortfolioAndAnalyze(page: import('@playwright/test').Page) {
    await page.goto('/');

    // Add example stocks
    await page.getByRole('button', { name: /Add example stocks/i }).click();

    // Wait for stocks to be added
    await expect(page.getByText(/AAPL|MSFT|JNJ/)).toBeVisible({ timeout: 5000 });

    // Click analyze
    await page.getByRole('button', { name: /Analyze Dividends/i }).click();

    // Wait for results page
    await expect(page).toHaveURL(/\/results/, { timeout: 30000 });
  }

  test('should display suggestions section on results page', async ({ page }) => {
    await setupPortfolioAndAnalyze(page);

    // Wait for suggestions section to load
    await expect(
      page.getByRole('heading', { name: /Suggestions to Balance Your Dividends/i })
    ).toBeVisible({ timeout: 10000 });

    // Verify we have some suggestion cards
    const addButtons = page.getByRole('button', { name: /Add/i });
    const buttonCount = await addButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should show low months information', async ({ page }) => {
    await setupPortfolioAndAnalyze(page);

    // Wait for suggestions section
    await expect(
      page.getByRole('heading', { name: /Suggestions to Balance Your Dividends/i })
    ).toBeVisible({ timeout: 10000 });

    // Should show the monthly average and which months fall below
    await expect(page.getByText(/Your monthly average is/i)).toBeVisible();
    await expect(page.getByText(/month.*fall below this/i)).toBeVisible();
  });

  test('should navigate to home and open search when clicking Add', async ({
    page,
  }) => {
    await setupPortfolioAndAnalyze(page);

    // Wait for suggestions section
    await expect(
      page.getByRole('heading', { name: /Suggestions to Balance Your Dividends/i })
    ).toBeVisible({ timeout: 10000 });

    // Get the first suggestion card's ticker (now in muted text below the name)
    const firstCard = page.locator('[class*="Card"]').filter({ hasText: /Add/ }).first();
    const tickerText = await firstCard.locator('.text-muted-foreground').first().textContent();
    expect(tickerText).toBeTruthy();

    // Click Add button on the first suggestion
    await firstCard.getByRole('button', { name: /Add/i }).click();

    // Should navigate to home page
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Search dialog should be open with the ticker pre-filled
    await expect(page.getByPlaceholder(/Search stocks/i)).toBeVisible({
      timeout: 5000,
    });

    // The search input should have the ticker as value
    const searchInput = page.getByPlaceholder(/Search stocks/i);
    await expect(searchInput).toHaveValue(tickerText || '', { timeout: 5000 });
  });

  test('should show search results for suggested stock', async ({ page }) => {
    await setupPortfolioAndAnalyze(page);

    // Wait for suggestions section
    await expect(
      page.getByRole('heading', { name: /Suggestions to Balance Your Dividends/i })
    ).toBeVisible({ timeout: 10000 });

    // Get the first suggestion card's ticker (now in muted text below the name)
    const firstCard = page.locator('[class*="Card"]').filter({ hasText: /Add/ }).first();
    const tickerText = await firstCard.locator('.text-muted-foreground').first().textContent();

    // Click Add button
    await firstCard.getByRole('button', { name: /Add/i }).click();

    // Wait for search dialog
    await expect(page.getByPlaceholder(/Search stocks/i)).toBeVisible({
      timeout: 5000,
    });

    // Wait for search results to load (debounce + API call)
    await page.waitForTimeout(1000);

    // Should show search results that match the ticker
    await expect(
      page.getByText(tickerText || '', { exact: false })
    ).toBeVisible({ timeout: 5000 });
  });
});
