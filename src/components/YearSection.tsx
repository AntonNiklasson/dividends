'use client';

import { useState } from 'react';
import { DividendBarChart } from '@/components/DividendBarChart';
import { MonthDetails } from '@/components/MonthDetails';
import type { YearProjection } from '@/lib/types';

interface YearSectionProps {
  year: number;
  data: YearProjection;
}

export function YearSection({ year, data }: YearSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const selectedMonthData = selectedMonth
    ? data.months.find((m) => m.month === selectedMonth)
    : null;

  return (
    <section className="mb-8">
      {/* Year Header */}
      <div className="mb-4 p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
        <h2 className="text-xl sm:text-2xl font-bold">{year}</h2>
        <div className="mt-1">
          {data.yearTotal.USD ? (
            <span className="text-2xl sm:text-3xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(data.yearTotal.USD)}
            </span>
          ) : (
            <span className="text-muted-foreground">No dividends</span>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <DividendBarChart
        months={data.months}
        selectedMonth={selectedMonth}
        onMonthSelect={setSelectedMonth}
      />

      {/* Month Details (when selected) */}
      {selectedMonthData && (
        <MonthDetails
          monthData={selectedMonthData}
          onClose={() => setSelectedMonth(null)}
        />
      )}
    </section>
  );
}
