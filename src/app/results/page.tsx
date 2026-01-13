'use client';

import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { portfolioAtom, portfolioLoadingAtom } from '@/store/portfolioAtom';
import YearSection from '@/components/YearSection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function ResultsPage() {
  const portfolioData = useAtomValue(portfolioAtom);
  const isLoading = useAtomValue(portfolioLoadingAtom);
  const router = useRouter();

  const handleBackToPortfolio = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </header>

        <main>
          {/* Skeleton for year sections */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-8">
              <Card className="p-4 sm:p-6 mb-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-10 w-32" />
              </Card>
              <Skeleton className="h-48 sm:h-64 w-full rounded-lg" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (!portfolioData?.success || !portfolioData.projection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-muted mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No Analysis Yet</h2>
          <p className="text-muted-foreground mb-6">
            Build your portfolio and click Analyze to see dividend projections
          </p>
          <Button onClick={() => router.push('/')}>Go to Portfolio</Button>
        </Card>
      </div>
    );
  }

  const { projection } = portfolioData;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Dividend Projection
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Your 3-year dividend income projection with DRIP reinvestment
            </p>
          </div>
          <Button
            onClick={handleBackToPortfolio}
            variant="outline"
            className="w-auto hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </header>

      <main>
        {/* Vertical scroll of year sections */}
        {Object.keys(projection)
          .map(Number)
          .sort((a, b) => a - b)
          .map((year) => (
            <YearSection key={year} year={year} data={projection[year]} />
          ))}
      </main>
    </div>
  );
}
