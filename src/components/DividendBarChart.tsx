'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { MonthProjection } from '@/lib/types';

interface DividendBarChartProps {
  months: MonthProjection[];
  selectedMonth: number | null;
  onMonthSelect: (month: number | null) => void;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function DividendBarChart({
  months,
  selectedMonth,
  onMonthSelect,
}: DividendBarChartProps) {
  // Transform data for recharts (USD only)
  const chartData = months.map((m) => ({
    name: MONTH_NAMES[m.month - 1],
    month: m.month,
    amount: m.total.USD ?? 0,
  }));

  const handleClick = (data: { month: number }) => {
    if (data.month === selectedMonth) {
      onMonthSelect(null);
    } else {
      onMonthSelect(data.month);
    }
  };

  return (
    <div className="w-full h-48 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis hide />
          <Bar
            dataKey="amount"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            onClick={(_: unknown, idx: number) => handleClick(chartData[idx])}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.month}
                opacity={
                  selectedMonth === null || selectedMonth === entry.month
                    ? 1
                    : 0.4
                }
              />
            ))}
            <LabelList
              dataKey="amount"
              position="insideBottom"
              fill="white"
              fontSize={10}
              offset={8}
              formatter={(value) =>
                typeof value === 'number' && value > 0
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  : ''
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
