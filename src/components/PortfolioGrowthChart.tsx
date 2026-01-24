'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from './ui/card';
import type { StockWithDividends, ProjectionResponse } from '@/lib/types';
import { calculatePortfolioValue, calculateYearEndValue } from '@/lib/portfolioValue';

interface PortfolioGrowthChartProps {
  stocks: StockWithDividends[];
  projection: ProjectionResponse;
}

interface ChartDataPoint {
  label: string;
  bullish: number;
  flat: number;
  bearish: number;
}

export function PortfolioGrowthChart({ stocks, projection }: PortfolioGrowthChartProps) {
  const currentValue = calculatePortfolioValue(stocks);
  const years = Object.keys(projection).map(Number).sort((a, b) => a - b);

  // Build data points with all three scenarios
  const chartData: ChartDataPoint[] = [
    {
      label: 'Now',
      bullish: currentValue.totalUSD,
      flat: currentValue.totalUSD,
      bearish: currentValue.totalUSD,
    },
    ...years.map((year, index) => {
      const yearData = projection[year];
      const endOfYearShares = yearData.endOfYearShares || {};
      const yearsFromNow = index + 1;

      return {
        label: `${year}`,
        bullish: calculateYearEndValue(stocks, endOfYearShares, 1.1, yearsFromNow),
        flat: calculateYearEndValue(stocks, endOfYearShares, 1, yearsFromNow),
        bearish: calculateYearEndValue(stocks, endOfYearShares, 0.9, yearsFromNow),
      };
    }),
  ];

  // Calculate range for the flat scenario (main focus)
  const flatStart = chartData[0].flat;
  const flatEnd = chartData[chartData.length - 1].flat;
  const flatGrowth = flatEnd - flatStart;
  const flatGrowthPercent = flatStart > 0 ? (flatGrowth / flatStart) * 100 : 0;

  return (
    <Card className="mb-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Portfolio Growth Scenarios</h2>
        {flatGrowth > 0 && (
          <div className="text-right text-sm text-muted-foreground">
            DRIP alone: +${flatGrowth.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({flatGrowthPercent.toFixed(1)}%)
          </div>
        )}
      </div>

      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              hide
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-popover border rounded-md shadow-md px-3 py-2 text-sm">
                    <p className="font-medium mb-1">{label === 'Now' ? 'Current' : `End of ${label}`}</p>
                    {payload.map((entry) => (
                      <div key={entry.dataKey} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">
                          {entry.dataKey === 'bullish' ? '+10%/yr' : entry.dataKey === 'bearish' ? '-10%/yr' : 'Flat'}:
                        </span>
                        <span className="font-medium">
                          ${(entry.value as number).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === 'bullish') return '+10%/year';
                if (value === 'bearish') return '-10%/year';
                return 'Flat';
              }}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="bullish"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#22c55e', strokeWidth: 0, r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="flat"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="bearish"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#ef4444', strokeWidth: 0, r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Shows projected value with DRIP reinvestment under different price scenarios
      </p>
    </Card>
  );
}
