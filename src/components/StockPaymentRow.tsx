import type { ProjectedPayment } from '@/lib/types';

interface StockPaymentRowProps {
  payment: ProjectedPayment;
}

export function StockPaymentRow({ payment }: StockPaymentRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-1 text-sm border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4 flex-1">
        <span className="font-medium text-gray-900 w-20">{payment.ticker}</span>
        <span className="text-gray-600 w-32">
          {new Date(payment.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="text-gray-500 text-xs">
          {payment.sharesAtPayment.toFixed(2)} shares
        </span>
      </div>
      <div className="font-medium text-gray-900">
        {payment.amount.toFixed(2)} {payment.currency}
      </div>
    </div>
  );
}
