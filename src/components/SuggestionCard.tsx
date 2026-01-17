'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { SuggestedStockWithCoverage } from '@/lib/suggestStocks';

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

interface SuggestionCardProps {
  stock: SuggestedStockWithCoverage;
  lowMonths: number[];
  onAdd: (ticker: string) => void;
}

export default function SuggestionCard({
  stock,
  lowMonths,
  onAdd,
}: SuggestionCardProps) {
  const formatMonths = (months: number[]) =>
    months.map((m) => MONTH_NAMES[m - 1]).join(', ');

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{stock.ticker}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {stock.sector}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{stock.name}</p>

          <div className="mt-2 flex flex-wrap gap-1">
            {stock.typicalMonths.map((month) => {
              const isLowMonth = lowMonths.includes(month);
              return (
                <span
                  key={month}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isLowMonth
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {MONTH_NAMES[month - 1]}
                </span>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Fills {stock.coveredMonths.length} low month
            {stock.coveredMonths.length !== 1 ? 's' : ''}:{' '}
            <span className="font-medium text-primary">
              {formatMonths(stock.coveredMonths)}
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdd(stock.ticker)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
    </Card>
  );
}
