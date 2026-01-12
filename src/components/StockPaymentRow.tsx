import type { ProjectedPayment } from '@/lib/types';

interface StockPaymentRowProps {
  payment: ProjectedPayment;
}

export function StockPaymentRow({ payment }: StockPaymentRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-2 gap-2 sm:gap-0 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-sm">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <span className="font-semibold w-20 text-sm">{payment.ticker}</span>
        <span className="text-muted-foreground text-sm">
          {new Date(payment.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="text-muted-foreground text-xs ml-auto sm:ml-0">
          {payment.sharesAtPayment.toFixed(2)} shares
        </span>
      </div>
      <div className="font-semibold self-end sm:self-auto">
        {payment.amount.toFixed(2)} {payment.currency}
      </div>
    </div>
  );
}
