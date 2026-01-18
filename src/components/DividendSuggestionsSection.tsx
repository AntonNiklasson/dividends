'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SuggestionCard from '@/components/SuggestionCard';
import { analyzeLowMonths } from '@/lib/analyzeLowMonths';
import { suggestStocks } from '@/lib/suggestStocks';
import type { ProjectionResponse } from '@/lib/types';

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

interface DividendSuggestionsSectionProps {
  projection: ProjectionResponse;
  existingTickers: string[];
}

export default function DividendSuggestionsSection({
  projection,
  existingTickers,
}: DividendSuggestionsSectionProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const { lowMonths, average } = useMemo(
    () => analyzeLowMonths(projection),
    [projection]
  );

  const suggestions = useMemo(
    // refreshKey is used to trigger re-randomization
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    () => suggestStocks(lowMonths, existingTickers, 5),
    [lowMonths, existingTickers, refreshKey]
  );

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Don't render if there are no low months or no suggestions
  if (lowMonths.length === 0 || suggestions.length === 0) {
    return null;
  }

  const handleAddStock = (ticker: string) => {
    // Navigate to home page with search query parameter
    router.push(`/?search=${encodeURIComponent(ticker)}`);
  };

  const formatMonths = (months: number[]) =>
    months.map((m) => MONTH_NAMES[m - 1]).join(', ');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-4 p-4 sm:p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/15 rounded-xl border border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              Suggestions to Balance Your Dividends
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your monthly average is {formatCurrency(average)}.{' '}
              {lowMonths.length} month{lowMonths.length !== 1 ? 's' : ''} fall
              below this:{' '}
              <span className="font-medium">{formatMonths(lowMonths)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((stock) => (
          <SuggestionCard
            key={stock.ticker}
            stock={stock}
            lowMonths={lowMonths}
            onAdd={handleAddStock}
          />
        ))}
      </div>

      {/* Footer with refresh button */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Show other suggestions
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Click &quot;Add&quot; to add a stock to your portfolio. Payment months
          are based on historical patterns.
        </p>
      </div>
    </section>
  );
}
