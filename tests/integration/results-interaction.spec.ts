import { test, expect } from '@playwright/test';

// These tests verify the results page structure
// They require a successful analysis which depends on external APIs
// Mark as slow to allow for API response time
test.describe('Results Page', () => {
  test.skip('should display results page structure when data exists', async ({
    page,
  }) => {
    // This test is skipped by default as it requires real API calls
    // Enable manually for full integration testing

    await page.goto('/results');

    // If no data, should redirect or show error
    // If data exists, should show projection
    const heading = page.getByRole('heading', { name: 'Dividend Projection' });
    const noDataMessage = page.getByText(/no data|portfolio/i);

    const hasHeading = await heading.isVisible().catch(() => false);
    const hasNoData = await noDataMessage.isVisible().catch(() => false);

    expect(hasHeading || hasNoData).toBe(true);
  });
});
