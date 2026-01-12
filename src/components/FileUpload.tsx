'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { useState, useRef } from 'react';

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    console.log('File selected:', file.name);
    // TODO: Handle file in next phases
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
      />
      <Card
        className={`w-full max-w-xl p-8 border-2 border-dashed transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Upload
              className={`w-8 h-8 transition-colors ${
                isDragging ? 'text-blue-500' : 'text-gray-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Portfolio CSV
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop your Avanza export file here, or click to browse
            </p>
          </div>

          <Button variant="outline" type="button">
            Browse Files
          </Button>

          <div className="text-xs text-gray-400">
            Accepted format: <span className="font-mono">.csv</span>
          </div>
        </div>
      </Card>
    </>
  );
}
