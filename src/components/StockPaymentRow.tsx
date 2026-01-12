import type { ProjectedPayment } from '@/lib/types';

interface StockPaymentRowProps {
  payment: ProjectedPayment;
}

export function StockPaymentRow({ payment }: StockPaymentRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 px-1 gap-2 sm:gap-0 text-xs sm:text-sm border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <span className="font-medium text-gray-900 w-16 sm:w-20">
          {payment.ticker}
        </span>
        <span className="text-gray-600 text-xs sm:text-sm">
          {new Date(payment.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="text-gray-500 text-xs ml-auto sm:ml-0">
          {payment.sharesAtPayment.toFixed(2)} shares
        </span>
      </div>
      <div className="font-medium text-gray-900 text-sm sm:text-base self-end sm:self-auto">
        {payment.amount.toFixed(2)} {payment.currency}
      </div>
    </div>
  );
}
