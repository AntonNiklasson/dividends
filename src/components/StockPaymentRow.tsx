import type { ProjectedPayment } from '@/lib/types';

interface StockPaymentRowProps {
  payment: ProjectedPayment;
}

export function StockPaymentRow({ payment }: StockPaymentRowProps) {
  const formattedAmount = new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(payment.amount);

  const formattedDate = new Date(payment.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[5rem_auto_1fr_auto] items-center gap-x-3 gap-y-1 py-3 px-3 border-b last:border-0 hover:bg-muted/50 transition-colors rounded-md">
      {/* Name - always visible */}
      <span className="font-semibold text-sm">{payment.name}</span>

      {/* Date - on same row */}
      <span className="text-muted-foreground text-sm">{formattedDate}</span>

      {/* Shares - hidden on mobile, shown on desktop */}
      <span className="text-muted-foreground text-xs hidden sm:block">
        {payment.sharesAtPayment.toFixed(2)} shares
      </span>

      {/* Amount - always visible, right aligned */}
      <span className="font-semibold text-right whitespace-nowrap">
        {formattedAmount} {payment.currency}
      </span>

      {/* Mobile-only shares count on second row */}
      <span className="col-span-3 sm:hidden text-xs text-muted-foreground">
        {payment.sharesAtPayment.toFixed(2)} shares
      </span>
    </div>
  );
}
