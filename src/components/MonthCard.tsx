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
    <Card className={`transition-opacity ${!hasPayments ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="font-semibold">{monthName}</span>
          {hasPayments && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="ml-auto text-sm font-normal text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                {isOpen ? (
                  <>
                    <span className="hidden sm:inline">Collapse</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Expand</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasPayments ? (
          <>
            <div className="text-lg font-semibold mb-4">{formattedTotal}</div>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleContent>
                <div className="space-y-1 pt-3 border-t">
                  {payments.map((payment, index) => (
                    <StockPaymentRow key={index} payment={payment} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No dividend payments expected this month
          </div>
        )}
      </CardContent>
    </Card>
  );
}
