'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, XCircle } from 'lucide-react';
import { TickerError, StockWithDividends } from '@/lib/types';

interface ErrorBannerProps {
  tickerErrors: TickerError[];
  noDividendStocks: StockWithDividends[];
}

export default function ErrorBanner({
  tickerErrors,
  noDividendStocks,
}: ErrorBannerProps) {
  const hasTickerErrors = tickerErrors.length > 0;
  const hasNoDividendStocks = noDividendStocks.length > 0;

  if (!hasTickerErrors && !hasNoDividendStocks) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      {hasTickerErrors && (
        <Alert variant="destructive" className="text-sm">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">
            Ticker Lookup Failed
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            <p className="mb-2">
              Could not find dividend data for the following tickers:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {tickerErrors.map((error) => (
                <li key={error.ticker} className="break-words">
                  <strong>{error.ticker}</strong>: {error.error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasNoDividendStocks && (
        <Alert className="text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">
            No Dividend History
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            <p className="mb-2">
              The following stocks have no dividend payments in the last 12
              months and are excluded from projections:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {noDividendStocks.map((stock) => (
                <li key={stock.ticker} className="break-words">
                  <strong>{stock.ticker}</strong> ({stock.name})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
