'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type Year = 2026 | 2027 | 2028;

interface YearTabsProps {
  children: (year: Year) => React.ReactNode;
}

export default function YearTabs({ children }: YearTabsProps) {
  const years: Year[] = [2026, 2027, 2028];

  return (
    <Tabs defaultValue="2026">
      <TabsList>
        {years.map((year) => (
          <TabsTrigger key={year} value={year.toString()}>
            {year}
          </TabsTrigger>
        ))}
      </TabsList>

      {years.map((year) => (
        <TabsContent key={year} value={year.toString()}>
          {children(year)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
