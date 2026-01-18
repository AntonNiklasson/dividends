import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Error Handling', () => {
  test('should show error for invalid file type', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify upload page loads
    await expect(
      page.getByRole('heading', { name: 'Dividend Portfolio Projector' })
    ).toBeVisible();

    // Create a temporary text file to test invalid file type
    const tmpFilePath = path.join(process.cwd(), 'tmp-test-file.txt');
    fs.writeFileSync(tmpFilePath, 'This is not a CSV file');

    try {
      // Upload the invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tmpFilePath);

      // Wait for error message to appear
      await expect(page.getByText('Upload Failed')).toBeVisible({
        timeout: 5000,
      });

      // Verify the specific error message
      await expect(
        page.getByText(/Invalid file type.*CSV file/i)
      ).toBeVisible();

      // Verify "Try Again" button is present
      const tryAgainButton = page.getByRole('button', { name: /try again/i });
      await expect(tryAgainButton).toBeVisible();

      // Verify we're still on the home page (not navigated to results)
      await expect(page).toHaveURL('/');
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
  });

  test('should show error for file that is too large', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Create a temporary CSV file that exceeds 5MB
    const tmpFilePath = path.join(process.cwd(), 'tmp-large-file.csv');
    const sixMB = 6 * 1024 * 1024;
    const buffer = Buffer.alloc(sixMB, 'a');
    fs.writeFileSync(tmpFilePath, buffer);

    try {
      // Upload the large file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tmpFilePath);

      // Wait for error message to appear
      await expect(page.getByText('Upload Failed')).toBeVisible({
        timeout: 5000,
      });

      // Verify the specific error message
      await expect(
        page.getByText(/File is too large.*Maximum file size is 5MB/i)
      ).toBeVisible();

      // Verify "Try Again" button is present
      const tryAgainButton = page.getByRole('button', { name: /try again/i });
      await expect(tryAgainButton).toBeVisible();

      // Verify we're still on the home page
      await expect(page).toHaveURL('/');
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
  });

  test('should show error for invalid CSV format', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Create a CSV file with incorrect format (wrong delimiter, missing columns)
    const tmpFilePath = path.join(process.cwd(), 'tmp-invalid-csv.csv');
    const invalidCsv = `Name,Ticker,Shares
Apple,AAPL,10
Microsoft,MSFT,5`;
    fs.writeFileSync(tmpFilePath, invalidCsv);

    try {
      // Upload the invalid CSV file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tmpFilePath);

      // Wait for error message to appear
      // This should be an API error since client validation only checks extension/size
      await expect(page.getByText('Upload Failed')).toBeVisible({
        timeout: 10000,
      });

      // The error should mention missing required columns
      await expect(
        page.getByText(/Missing required column|Invalid CSV format/i)
      ).toBeVisible();

      // Verify "Try Again" button is present
      const tryAgainButton = page.getByRole('button', { name: /try again/i });
      await expect(tryAgainButton).toBeVisible();

      // Verify we're still on the home page
      await expect(page).toHaveURL('/');
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
  });

  test('should allow retry after error', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Create an invalid file (wrong extension)
    const tmpInvalidPath = path.join(process.cwd(), 'tmp-test-invalid.txt');
    fs.writeFileSync(tmpInvalidPath, 'Invalid file');

    try {
      // Upload the invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tmpInvalidPath);

      // Wait for error message
      await expect(page.getByText('Upload Failed')).toBeVisible({
        timeout: 5000,
      });

      // Click "Try Again" button
      const tryAgainButton = page.getByRole('button', { name: /try again/i });
      await tryAgainButton.click();

      // Verify error state is cleared and we're back to the upload state
      await expect(page.getByText('Upload Failed')).not.toBeVisible();
      await expect(page.getByText('Upload Portfolio CSV')).toBeVisible();

      // Now upload a valid file to verify the upload still works
      const validFilePath = path.join(
        process.cwd(),
        'public',
        'sample-portfolio.csv'
      );
      await fileInput.setInputFiles(validFilePath);

      // Verify successful upload and navigation to results
      await expect(page).toHaveURL(/\/results/, { timeout: 30000 });
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tmpInvalidPath)) {
        fs.unlinkSync(tmpInvalidPath);
      }
    }
  });

  test('should show error state styling on upload card', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Create an invalid file
    const tmpFilePath = path.join(process.cwd(), 'tmp-test-style.txt');
    fs.writeFileSync(tmpFilePath, 'Invalid file');

    try {
      // Upload the invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(tmpFilePath);

      // Wait for error message
      await expect(page.getByText('Upload Failed')).toBeVisible({
        timeout: 5000,
      });

      // Verify the upload card has error styling
      // The Card component should have destructive border classes when in error state
      const uploadCard = page.locator('[class*="border-destructive"]').first();
      await expect(uploadCard).toBeVisible();

      // Verify the alert component is visible
      // Use a more specific selector to avoid the Next.js route announcer
      const alert = page.getByText('Upload Failed').first().locator('..');
      await expect(alert).toBeVisible();

      // Verify alert has AlertCircle icon (destructive variant)
      const alertIcon = alert.locator('svg').first();
      await expect(alertIcon).toBeVisible();
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
    }
  });
});
