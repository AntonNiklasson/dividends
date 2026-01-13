'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StockPaymentRow } from '@/components/StockPaymentRow';
import type { MonthProjection } from '@/lib/types';

interface MonthDetailsProps {
  monthData: MonthProjection;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MonthDetails({ monthData, onClose }: MonthDetailsProps) {
  const monthName = MONTH_NAMES[monthData.month - 1];
  const hasPayments = monthData.payments.length > 0;

  return (
    <Card className="p-4 mt-4 border-2 border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">{monthName}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {hasPayments ? (
        <div className="divide-y">
          {monthData.payments.map((payment, idx) => (
            <StockPaymentRow key={`${payment.ticker}-${idx}`} payment={payment} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No dividend payments this month
        </p>
      )}

      {hasPayments && monthData.total.USD && (
        <div className="mt-3 pt-3 border-t text-sm">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-semibold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(monthData.total.USD)}
          </span>
        </div>
      )}
    </Card>
  );
}
