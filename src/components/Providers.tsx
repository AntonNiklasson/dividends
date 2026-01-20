'use client';

import { Suspense, type ReactNode } from 'react';
import { Header } from './Header';
import { PortfolioImportDialog } from './PortfolioImportDialog';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Suspense fallback={null}>
        <PortfolioImportDialog />
      </Suspense>
    </>
  );
}
