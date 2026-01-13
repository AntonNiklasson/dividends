'use client';

import { useAtom, useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { portfolioAtom, portfolioLoadingAtom } from '@/store/portfolioAtom';
import YearTabs from '@/components/YearTabs';
import MonthCard from '@/components/MonthCard';
import ErrorBanner from '@/components/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export default function ResultsPage() {
  const [portfolioData, setPortfolioData] = useAtom(portfolioAtom);
  const isLoading = useAtomValue(portfolioLoadingAtom);
  const router = useRouter();

  const handleUploadNew = () => {
    // Clear the portfolio state
    setPortfolioData(null);
    // Navigate back to home
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </header>

        <main>
          {/* Skeleton for tabs */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Skeleton for year total */}
          <Card className="p-6 mb-8 shadow-sm">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-8 w-40" />
          </Card>

          {/* Skeleton for month cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!portfolioData?.success || !portfolioData.projection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-muted mx-auto mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-6">
            Upload a portfolio CSV to see your dividend projections
          </p>
          <Button onClick={() => router.push('/')}>Upload Portfolio</Button>
        </Card>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Dividend Projection
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Your 3-year dividend income projection with DRIP reinvestment
            </p>
          </div>
          <Button
            onClick={handleUploadNew}
            variant="outline"
            className="w-auto hover:bg-accent transition-colors"
          >
            <Upload className="w-4 h-4 mr-2 hidden sm:inline" />
            Upload New
          </Button>
        </div>
      </header>

      <main>
        {(tickerErrors.length > 0 || noDividendStocks.length > 0) && (
          <ErrorBanner
            tickerErrors={tickerErrors}
            noDividendStocks={noDividendStocks}
          />
        )}
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
                <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Projected Income {year}
                      </p>
                      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mt-2">
                        {Object.entries(yearData.yearTotal).map(
                          ([currency, amount]) => (
                            <div
                              key={currency}
                              className="flex items-baseline gap-2"
                            >
                              <span className="text-3xl sm:text-4xl font-bold text-foreground">
                                {new Intl.NumberFormat('sv-SE', {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(amount)}
                              </span>
                              <span className="text-lg font-medium text-muted-foreground">
                                {currency}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        With DRIP
                      </span>
                    </div>
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
