'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { StockPaymentRow } from '@/components/StockPaymentRow';
import type { ProjectedPayment } from '@/lib/types';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';

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

const formatCurrency = (amount: number, currency: string) => {
  return (
    new Intl.NumberFormat('sv-SE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) +
    ' ' +
    currency
  );
};

export default function MonthCard({ month, total, payments }: MonthCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const monthName = MONTH_NAMES[month - 1];

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile for cards with many payments
  useEffect(() => {
    if (isMobile && payments.length > 3) {
      setIsOpen(false);
    }
  }, [isMobile, payments.length]);

  // Format total by currency with consistent formatting
  const formattedTotal = Object.entries(total)
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(' · ');

  const hasPayments = payments.length > 0;

  return (
    <Card
      className={`transition-all duration-200 ${
        !hasPayments
          ? 'bg-muted/30 border-dashed'
          : 'hover:shadow-md card-interactive'
      }`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <span className="font-semibold">{monthName}</span>
            {hasPayments && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                {payments.length}
              </span>
            )}
          </div>
          {hasPayments && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="text-sm font-normal text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted">
                <span className="text-xs">{isOpen ? 'Hide' : 'Show'}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
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
            {Object.keys(total).length > 1 && (
              <p className="text-xs text-muted-foreground mb-4">
                Multiple currencies shown separately
              </p>
            )}
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
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>No dividend payments expected this month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
