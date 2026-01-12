import { Card } from './ui/card';
import { Upload } from 'lucide-react';

export default function FileUpload() {
  return (
    <Card className="w-full max-w-xl p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Upload className="w-8 h-8 text-gray-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Portfolio CSV
          </h3>
          <p className="text-sm text-gray-500">
            Drag and drop your Avanza export file here, or click to browse
          </p>
        </div>

        <div className="text-xs text-gray-400">
          Accepted format: <span className="font-mono">.csv</span>
        </div>
      </div>
    </Card>
  );
}
