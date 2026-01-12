'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { StockPaymentRow } from '@/components/StockPaymentRow';
import type { ProjectedPayment } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MonthCardProps {
  month: number; // 1-12
  total: Record<string, number>; // Currency -> total amount
  payments: ProjectedPayment[];
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

export default function MonthCard({ month, total, payments }: MonthCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const monthName = MONTH_NAMES[month - 1];

  // Format total by currency
  const formattedTotal = Object.entries(total)
    .map(([currency, amount]) => `${amount.toFixed(2)} ${currency}`)
    .join(', ');

  const hasPayments = payments.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{monthName}</span>
          {hasPayments && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="ml-auto text-sm font-normal text-gray-500 hover:text-gray-700 flex items-center gap-1">
                {isOpen ? (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold mb-4">
          {formattedTotal || 'No dividends'}
        </div>
        {hasPayments && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent>
              <div className="space-y-1 pt-2 border-t border-gray-200">
                {payments.map((payment, index) => (
                  <StockPaymentRow key={index} payment={payment} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
