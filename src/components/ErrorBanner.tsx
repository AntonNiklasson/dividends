'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, XCircle } from 'lucide-react';
import { TickerError, StockWithDividends } from '@/lib/types';

interface ErrorBannerProps {
  tickerErrors: TickerError[];
  noDividendStocks: StockWithDividends[];
}

export function ErrorBanner({
  tickerErrors,
  noDividendStocks,
}: ErrorBannerProps) {
  const hasTickerErrors = tickerErrors.length > 0;
  const hasNoDividendStocks = noDividendStocks.length > 0;

  if (!hasTickerErrors && !hasNoDividendStocks) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {hasTickerErrors && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Ticker Lookup Failed</AlertTitle>
          <AlertDescription className="text-sm">
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Dividend History</AlertTitle>
          <AlertDescription className="text-sm">
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
