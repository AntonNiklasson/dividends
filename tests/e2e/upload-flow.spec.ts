import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Successful Upload Flow', () => {
  test('should upload valid CSV file and display results', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify upload page loads
    await expect(
      page.getByRole('heading', { name: 'Dividend Portfolio Projector' })
    ).toBeVisible();
    await expect(page.getByText('Upload Your Portfolio')).toBeVisible();

    // Upload sample portfolio file
    const filePath = path.join(process.cwd(), 'public', 'sample-portfolio.csv');

    // Find the hidden file input and upload the file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for the upload and processing to complete
    // The app should show a loading state and then navigate to results
    await expect(page).toHaveURL(/\/results/, { timeout: 30000 });

    // Verify results page loaded successfully
    await expect(
      page.getByRole('heading', { name: 'Dividend Projection' })
    ).toBeVisible();

    // Verify year tabs are present
    await expect(page.getByRole('tab', { name: '2026' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '2027' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '2028' })).toBeVisible();

    // Verify 2026 tab is active by default
    await expect(page.getByRole('tab', { name: '2026' })).toHaveAttribute(
      'data-state',
      'active'
    );

    // Verify month cards are displayed (at least January)
    // Month names are displayed in CardTitle (not semantic heading)
    await expect(
      page.getByText('January', { exact: true }).first()
    ).toBeVisible();

    // Verify total dividend display exists
    await expect(page.getByText(/Total for 2026/i)).toBeVisible();

    // Verify "Upload new file" button exists
    await expect(
      page.getByRole('button', { name: /upload new file/i })
    ).toBeVisible();
  });

  test('should display data for all three years', async ({ page }) => {
    // Navigate and upload
    await page.goto('/');

    const filePath = path.join(process.cwd(), 'public', 'sample-portfolio.csv');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for results page
    await expect(page).toHaveURL(/\/results/, { timeout: 30000 });

    // Check 2026 (already active)
    await expect(
      page.getByText('January', { exact: true }).first()
    ).toBeVisible();
    const total2026 = await page
      .getByText(/Total for 2026/i)
      .first()
      .textContent();
    expect(total2026).toBeTruthy();

    // Switch to 2027 tab
    await page.getByRole('tab', { name: '2027' }).click();
    await expect(
      page.getByText('January', { exact: true }).first()
    ).toBeVisible();
    const total2027 = await page
      .getByText(/Total for 2027/i)
      .first()
      .textContent();
    expect(total2027).toBeTruthy();

    // Switch to 2028 tab
    await page.getByRole('tab', { name: '2028' }).click();
    await expect(
      page.getByText('January', { exact: true }).first()
    ).toBeVisible();
    const total2028 = await page
      .getByText(/Total for 2028/i)
      .first()
      .textContent();
    expect(total2028).toBeTruthy();
  });

  test('should show expandable month details', async ({ page }) => {
    // Navigate and upload
    await page.goto('/');

    const filePath = path.join(process.cwd(), 'public', 'sample-portfolio.csv');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for results page
    await expect(page).toHaveURL(/\/results/, { timeout: 30000 });

    // Find a month card with dividend data
    // We'll look for any month that has a chevron/expand button
    const expandButtons = page
      .locator('[data-testid*="expand"], button')
      .filter({
        hasText: /chevron|expand|▼|▶/i,
      });

    if ((await expandButtons.count()) > 0) {
      // Click the first expand button
      await expandButtons.first().click();

      // Wait a moment for expansion animation
      await page.waitForTimeout(300);

      // Verify some stock details are now visible
      // Stock payment rows should have ticker, amount, date, shares
      const detailsVisible =
        (await page.getByText(/shares/i).count()) > 0 ||
        (await page.getByText(/\d{4}-\d{2}-\d{2}/).count()) > 0;

      expect(detailsVisible).toBe(true);
    }
  });

  test('should allow navigation back to upload page', async ({ page }) => {
    // Navigate and upload
    await page.goto('/');

    const filePath = path.join(process.cwd(), 'public', 'sample-portfolio.csv');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for results page
    await expect(page).toHaveURL(/\/results/, { timeout: 30000 });

    // Click "Upload new file" button
    const uploadButton = page.getByRole('button', {
      name: /upload new file/i,
    });
    await uploadButton.click();

    // Verify we're back on the home page
    await expect(page).toHaveURL('/');
    await expect(
      page.getByRole('heading', { name: 'Dividend Portfolio Projector' })
    ).toBeVisible();
    await expect(page.getByText('Upload Your Portfolio')).toBeVisible();
  });
});
