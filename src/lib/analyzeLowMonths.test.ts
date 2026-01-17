import { describe, it, expect } from 'vitest';
import { analyzeLowMonths } from './analyzeLowMonths';
import { ProjectionResponse } from './types';

// Helper to create a projection response with specific monthly totals
function createProjection(monthlyTotals: number[]): ProjectionResponse {
  const currentYear = new Date().getFullYear();
  return {
    [currentYear]: {
      months: monthlyTotals.map((total, index) => ({
        month: index + 1,
        total: total > 0 ? { USD: total } : {},
        payments: [],
      })),
      yearTotal: { USD: monthlyTotals.reduce((sum, t) => sum + t, 0) },
    },
  };
}

describe('analyzeLowMonths', () => {
  it('should identify months below average', () => {
    // Average: (100 + 200 + 300) / 12 = 50
    // Low months: all except months 1, 2, 3
    const projection = createProjection([
      100, 200, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    const result = analyzeLowMonths(projection);

    expect(result.average).toBe(50);
    expect(result.lowMonths).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('should handle portfolio with no dividends', () => {
    const projection = createProjection([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const result = analyzeLowMonths(projection);

    expect(result.average).toBe(0);
    expect(result.lowMonths).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('should handle portfolio with all equal months', () => {
    const projection = createProjection([
      100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    ]);

    const result = analyzeLowMonths(projection);

    expect(result.average).toBe(100);
    // No months are below average
    expect(result.lowMonths).toEqual([]);
  });

  it('should always include zero-dividend months as low', () => {
    // Average: 1200 / 12 = 100
    // Month 6 is zero, should be included even though others are above average
    const projection = createProjection([
      200, 200, 200, 100, 100, 0, 100, 100, 100, 50, 25, 25,
    ]);

    const result = analyzeLowMonths(projection);

    expect(result.lowMonths).toContain(6);
    // Also check that below-average months are included
    expect(result.lowMonths).toContain(10); // 50 < 100
    expect(result.lowMonths).toContain(11); // 25 < 100
    expect(result.lowMonths).toContain(12); // 25 < 100
  });

  it('should handle single dividend payment in one month', () => {
    // Only March has dividend
    const projection = createProjection([0, 0, 1200, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const result = analyzeLowMonths(projection);

    expect(result.average).toBe(100);
    // All months except March (3) are low
    expect(result.lowMonths).toEqual([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(result.lowMonths).not.toContain(3);
  });

  it('should use first year from projection', () => {
    const currentYear = new Date().getFullYear();
    const projection: ProjectionResponse = {
      [currentYear]: {
        months: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          total: { USD: 100 },
          payments: [],
        })),
        yearTotal: { USD: 1200 },
      },
      [currentYear + 1]: {
        months: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          total: { USD: 50 }, // Different values in year 2
          payments: [],
        })),
        yearTotal: { USD: 600 },
      },
    };

    const result = analyzeLowMonths(projection);

    // Should use year 1's average (100), not year 2's (50)
    expect(result.average).toBe(100);
  });

  it('should handle empty projection', () => {
    const projection: ProjectionResponse = {};

    const result = analyzeLowMonths(projection);

    expect(result.average).toBe(0);
    expect(result.lowMonths).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('should not include months that are exactly average', () => {
    // Set up so some months are exactly at average
    const projection = createProjection([
      50, 50, 50, 50, 100, 100, 100, 100, 50, 50, 50, 50,
    ]);

    const result = analyzeLowMonths(projection);

    // Average is 700/12 ≈ 58.33
    // Months with 50 are below average
    expect(result.lowMonths).toEqual([1, 2, 3, 4, 9, 10, 11, 12]);
  });
});
