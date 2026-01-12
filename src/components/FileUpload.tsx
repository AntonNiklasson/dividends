'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { uploadAtom } from '@/store/uploadAtom';

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useAtom(uploadAtom);
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
    setUploadStatus({
      state: 'uploading',
      file,
      error: null,
    });

    // Simulate upload for now - will be replaced with actual API call in Phase 47
    setTimeout(() => {
      setUploadStatus({
        state: 'success',
        file,
        error: null,
      });
    }, 1000);
  };

  const renderContent = () => {
    switch (uploadStatus.state) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Processing...
              </h3>
              <p className="text-sm text-gray-500">
                Analyzing your portfolio file
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Successful
              </h3>
              <p className="text-sm text-gray-500">{uploadStatus.file?.name}</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
              <Upload className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-900">
                Upload Failed
              </h3>
              <p className="text-sm text-red-600">
                {uploadStatus.error || 'Something went wrong'}
              </p>
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                setUploadStatus({ state: 'idle', file: null, error: null })
              }
            >
              Try Again
            </Button>
          </div>
        );

      default: // 'idle'
        return (
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
        );
    }
  };

  const isInteractive =
    uploadStatus.state === 'idle' || uploadStatus.state === 'error';

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
        disabled={!isInteractive}
      />
      <Card
        className={`w-full max-w-xl p-8 border-2 border-dashed transition-colors ${
          isInteractive ? 'cursor-pointer' : 'cursor-default'
        } ${
          isDragging && isInteractive
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus.state === 'error'
              ? 'border-red-300'
              : uploadStatus.state === 'success'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={isInteractive ? handleDragOver : undefined}
        onDragLeave={isInteractive ? handleDragLeave : undefined}
        onDrop={isInteractive ? handleDrop : undefined}
        onClick={
          isInteractive && uploadStatus.state === 'idle'
            ? handleClick
            : undefined
        }
      >
        {renderContent()}
      </Card>
    </>
  );
}
