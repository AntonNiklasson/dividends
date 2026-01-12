import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl p-8">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Upload Your Portfolio
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload a CSV export from Avanza to project your dividend income
              for the next 3 years
            </p>
          </div>
          {/* File upload component will go here */}
          <div className="flex min-h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
            <p className="text-muted-foreground">File upload component</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
