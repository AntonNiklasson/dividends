import PortfolioView from '@/components/PortfolioView';

export default function Home() {
  return (
    <div className="flex flex-col items-center px-4 gap-6">
      <div className="text-center max-w-lg">
        <h2 className="text-2xl font-semibold mb-2">Build Your Portfolio</h2>
        <p className="text-sm text-muted-foreground">
          Add stocks to project your dividend income for the next 3 years with
          automatic reinvestment
        </p>
      </div>
      <PortfolioView />
    </div>
  );
}
