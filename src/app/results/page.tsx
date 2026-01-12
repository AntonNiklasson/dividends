'use client';

import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { portfolioAtom } from '@/store/portfolioAtom';
import YearTabs from '@/components/YearTabs';
import MonthCard from '@/components/MonthCard';
import ErrorBanner from '@/components/ErrorBanner';
import { Button } from '@/components/ui/button';

export default function ResultsPage() {
  const [portfolioData, setPortfolioData] = useAtom(portfolioAtom);
  const router = useRouter();

  const handleUploadNew = () => {
    // Clear the portfolio state
    setPortfolioData(null);
    // Navigate back to home
    router.push('/');
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dividend Projection</h1>
            <p className="mt-2 text-muted-foreground">
              Your 3-year dividend income projection with DRIP reinvestment
            </p>
          </div>
          <Button onClick={handleUploadNew} variant="outline">
            Upload New File
          </Button>
        </div>
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
                {/* Year Total Display */}
                <div className="mb-8 p-6 bg-muted/50 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-3">
                    Total for {year}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(yearData.yearTotal).map(
                      ([currency, amount]) => (
                        <div key={currency} className="text-2xl font-bold">
                          {new Intl.NumberFormat('sv-SE', {
                            style: 'currency',
                            currency: currency,
                            minimumFractionDigits: 2,
                          }).format(amount)}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Monthly Breakdown */}
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
