'use client';

import { useAtom } from 'jotai';
import { portfolioAtom } from '@/store/portfolioAtom';
import YearTabs from '@/components/YearTabs';
import MonthCard from '@/components/MonthCard';
import ErrorBanner from '@/components/ErrorBanner';

export default function ResultsPage() {
  const [portfolioData] = useAtom(portfolioAtom);

  if (!portfolioData?.success || !portfolioData.projection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">No projection data available</p>
      </div>
    );
  }

  const { projection, portfolio } = portfolioData;

  // Extract ticker errors and non-dividend stocks
  const tickerErrors = portfolio?.errors || [];
  const noDividendStocks =
    portfolio?.stocks.filter((stock) => !stock.hasDividends) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dividend Projection</h1>
        <p className="mt-2 text-muted-foreground">
          Your 3-year dividend income projection with DRIP reinvestment
        </p>
      </header>

      <main>
        <ErrorBanner
          tickerErrors={tickerErrors}
          noDividendStocks={noDividendStocks}
        />
        <YearTabs>
          {(year) => {
            const yearData = projection[year];

            if (!yearData) {
              return (
                <p className="text-muted-foreground">No data for {year}</p>
              );
            }

            return (
              <div className="space-y-4 mt-6">
                {yearData.months.map((monthData) => (
                  <MonthCard
                    key={monthData.month}
                    month={monthData.month}
                    total={monthData.total}
                    payments={monthData.payments}
                  />
                ))}
              </div>
            );
          }}
        </YearTabs>
      </main>
    </div>
  );
}
