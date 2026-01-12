'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { uploadAtom } from '@/store/uploadAtom';
import { portfolioAtom } from '@/store/portfolioAtom';
import type { AnalyzeResponse } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useAtom(uploadAtom);
  const setPortfolio = useSetAtom(portfolioAtom);
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

  const validateFile = (file: File): string | null => {
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      return 'Invalid file type. Please upload a CSV file (.csv)';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return `File is too large. Maximum file size is ${sizeMB}MB`;
    }

    return null;
  };

  const handleFile = async (file: File) => {
    // Validate file before processing
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus({
        state: 'error',
        file: null,
        error: validationError,
      });
      return;
    }

    setUploadStatus({
      state: 'uploading',
      file,
      error: null,
    });

    try {
      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', file);

      // Call API endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data: AnalyzeResponse = await response.json();

      // Check if request was successful
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze portfolio');
      }

      // Store successful response in portfolioAtom
      setPortfolio(data);

      // Update upload status to success
      setUploadStatus({
        state: 'success',
        file,
        error: null,
      });
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setUploadStatus({
        state: 'error',
        file: null,
        error: errorMessage,
      });
    }
  };

  const renderContent = () => {
    switch (uploadStatus.state) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-2 w-full">
              <h3 className="text-lg font-semibold text-gray-900">
                Processing...
              </h3>
              <p className="text-sm text-gray-500">
                Analyzing your portfolio file
              </p>
              <div className="w-full pt-2">
                <Progress value={undefined} className="w-full" />
              </div>
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
            <Alert variant="destructive" className="mb-2 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>
                {uploadStatus.error || 'Something went wrong'}
              </AlertDescription>
            </Alert>
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
