'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthCardProps {
  month: number; // 1-12
  total: Record<string, number>; // Currency -> total amount
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

export default function MonthCard({ month, total }: MonthCardProps) {
  const monthName = MONTH_NAMES[month - 1];

  // Format total by currency
  const formattedTotal = Object.entries(total)
    .map(([currency, amount]) => `${amount.toFixed(2)} ${currency}`)
    .join(', ');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{monthName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold">
          {formattedTotal || 'No dividends'}
        </div>
      </CardContent>
    </Card>
  );
}
