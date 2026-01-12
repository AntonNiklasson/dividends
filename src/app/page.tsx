import { Card } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';

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
          <FileUpload />
        </div>
      </Card>
    </div>
  );
}
