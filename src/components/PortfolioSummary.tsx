'use client';

import { Card } from './ui/card';
import type { PortfolioValue } from '@/lib/portfolioValue';

interface PortfolioSummaryProps {
  value: PortfolioValue;
}

export function PortfolioSummary({ value }: PortfolioSummaryProps) {
  if (value.stocks.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 overflow-hidden">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-primary/20">
        <h2 className="text-lg sm:text-xl font-semibold text-muted-foreground">
          Portfolio Value
        </h2>
        <p className="text-3xl sm:text-4xl font-bold mt-1">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value.totalUSD)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Stock</th>
              <th className="text-right py-3 px-4 font-medium">Shares</th>
              <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Price</th>
              <th className="text-right py-3 px-4 font-medium">Value</th>
              <th className="text-right py-3 px-4 font-medium w-20">%</th>
            </tr>
          </thead>
          <tbody>
            {value.stocks.map((stock) => (
              <tr key={stock.ticker} className="border-b last:border-b-0 hover:bg-muted/30">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{stock.ticker}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                      {stock.name}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  {stock.shares.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right tabular-nums hidden sm:table-cell">
                  ${stock.priceUSD.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-medium tabular-nums">
                  ${stock.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                  {stock.percent.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
