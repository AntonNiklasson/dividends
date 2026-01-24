'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card } from './ui/card';
import type { StockWithDividends, ProjectionResponse } from '@/lib/types';
import { calculatePortfolioValue, calculateYearEndValue } from '@/lib/portfolioValue';

interface PortfolioGrowthChartProps {
  stocks: StockWithDividends[];
  projection: ProjectionResponse;
}

export function PortfolioGrowthChart({ stocks, projection }: PortfolioGrowthChartProps) {
  const currentValue = calculatePortfolioValue(stocks);
  const years = Object.keys(projection).map(Number).sort((a, b) => a - b);

  // Build data points: now + end of each year
  const chartData = [
    {
      label: 'Now',
      value: currentValue.totalUSD,
    },
    ...years.map((year) => {
      const yearData = projection[year];
      const endOfYearShares = yearData.endOfYearShares || {};
      return {
        label: `End ${year}`,
        value: calculateYearEndValue(stocks, endOfYearShares),
      };
    }),
  ];

  const growthAmount = chartData[chartData.length - 1].value - chartData[0].value;
  const growthPercent = chartData[0].value > 0
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
    : 0;

  return (
    <Card className="mb-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Portfolio Growth (DRIP)</h2>
        {growthAmount > 0 && (
          <div className="text-right">
            <span className="text-green-600 dark:text-green-400 font-medium">
              +${growthAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-muted-foreground ml-2 text-sm">
              ({growthPercent.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              hide
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const data = payload[0].payload as { label: string; value: number };
                return (
                  <div className="bg-popover border rounded-md shadow-md px-3 py-2">
                    <p className="text-sm font-medium">{data.label}</p>
                    <p className="text-lg font-bold">
                      ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Shows projected value growth from reinvesting dividends (DRIP) at current prices
      </p>
    </Card>
  );
}
