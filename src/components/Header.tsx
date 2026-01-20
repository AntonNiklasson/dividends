'use client';

import { PortfolioSelector } from './PortfolioSelector';

export function Header() {
  return (
    <header className="border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dividend Portfolio Projector</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Project your dividend income with DRIP reinvestment
            </p>
          </div>
          <PortfolioSelector />
        </div>
      </div>
    </header>
  );
}
