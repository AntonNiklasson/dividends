import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-2xl p-8 shadow-sm">
        <div className="space-y-8">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-semibold">Upload Your Portfolio</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload a CSV export from Avanza to project your dividend income
              for the next 3 years with automatic reinvestment
            </p>
          </div>
          <FileUpload />
          <div className="text-center pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Don&apos;t have a CSV file yet?
            </p>
            <Button
              variant="outline"
              asChild
              className="hover:bg-accent transition-colors"
            >
              <a href="/sample-portfolio.csv" download>
                Download Sample Portfolio
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
