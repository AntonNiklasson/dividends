import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show error for invalid CSV content', async ({ page }) => {
    await page.goto('/');

    // Verify portfolio page loads
    await expect(
      page.getByRole('heading', { name: 'Build Your Portfolio' })
    ).toBeVisible();

    // Create a CSV file with invalid content (no valid stock data)
    const tmpFilePath = path.join(process.cwd(), 'tmp-invalid-content.csv');
    fs.writeFileSync(tmpFilePath, 'random,data,here\n1,2,3\n');

    try {
      // Click Import CSV and upload the file
      const fileInput = page.locator('input#csv-import');
      await fileInput.setInputFiles(tmpFilePath);

      // Wait for error message to appear
      await expect(page.getByText('No valid stocks found in CSV')).toBeVisible({
        timeout: 5000,
      });
    } finally {
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
  });

  test('should show error for empty CSV', async ({ page }) => {
    await page.goto('/');

    // Create an empty CSV file
    const tmpFilePath = path.join(process.cwd(), 'tmp-empty.csv');
    fs.writeFileSync(tmpFilePath, '');

    try {
      const fileInput = page.locator('input#csv-import');
      await fileInput.setInputFiles(tmpFilePath);

      // Should show error for empty/invalid CSV
      await expect(
        page.getByText(/No valid stocks|Failed to parse/i)
      ).toBeVisible({
        timeout: 5000,
      });
    } finally {
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
  });

  test('should allow adding stocks manually', async ({ page }) => {
    await page.goto('/');

    // Click Add Stock button
    await page.getByRole('button', { name: 'Add Stock' }).click();

    // Search dialog should appear
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });

    // Close dialog by clicking outside or pressing escape
    await page.keyboard.press('Escape');
  });

});
