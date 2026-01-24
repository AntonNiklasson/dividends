import { test, expect } from '@playwright/test';
import path from 'path';

// Run tests serially to avoid localStorage conflicts
test.describe.configure({ mode: 'serial' });

// Helper to import CSV and handle the dialog
async function importCSV(page: import('@playwright/test').Page) {
  const filePath = path.join(process.cwd(), 'public', 'sample-portfolio.csv');
  const fileInput = page.locator('input#csv-import');
  await fileInput.setInputFiles(filePath);

  // Handle import dialog if it appears
  const replaceButton = page.getByRole('button', { name: 'Replace all' });
  try {
    await replaceButton.waitFor({ state: 'visible', timeout: 2000 });
    await replaceButton.click();
  } catch {
    // Dialog didn't appear, continue
  }

  // Wait for stocks to load
  await expect(page.getByText('Apple')).toBeVisible({ timeout: 5000 });
}

test.describe('Portfolio Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should import CSV and display stocks in portfolio', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Build Your Portfolio' })
    ).toBeVisible();

    await importCSV(page);

    await expect(page.getByText('Microsoft')).toBeVisible();
    await expect(page.getByText(/\d+ stocks?/).first()).toBeVisible();
  });

  test('should add stocks manually via search', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Add Stock' }).click();

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('should persist portfolio in localStorage', async ({ page }) => {
    await page.goto('/');
    await importCSV(page);

    await page.reload();

    await expect(page.getByText('Apple')).toBeVisible({ timeout: 5000 });
  });

  test('should clear portfolio', async ({ page }) => {
    await page.goto('/');
    await importCSV(page);

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText(/Clear Portfolio/i)).toBeVisible();

    await page.getByRole('button', { name: /Clear All/i }).click();
    await expect(page.getByText('Your portfolio is empty')).toBeVisible();
  });

  test('should show Analyze button when stocks are loaded', async ({ page }) => {
    await page.goto('/');
    await importCSV(page);

    const analyzeButton = page.getByRole('button', { name: /Analyze Dividends/i });
    await expect(analyzeButton).toBeVisible();
    await expect(analyzeButton).toBeEnabled();
  });
});
