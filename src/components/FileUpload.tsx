'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import {
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { uploadAtom } from '@/store/uploadAtom';
import { portfolioAtom, portfolioLoadingAtom } from '@/store/portfolioAtom';
import type { AnalyzeResponse } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useAtom(uploadAtom);
  const setPortfolio = useSetAtom(portfolioAtom);
  const setPortfolioLoading = useSetAtom(portfolioLoadingAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileSelect(file);
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

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    if (kb > 1024) {
      return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${Math.round(kb)} KB`;
  };

  // Show preview instead of immediate upload
  const handleFileSelect = (file: File) => {
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
      state: 'preview',
      file,
      error: null,
      filePreview: {
        name: file.name,
        size: formatFileSize(file.size),
      },
    });
  };

  // Actual upload triggered from preview state
  const handleUpload = async () => {
    const file = uploadStatus.file;
    if (!file) return;

    setUploadStatus({
      state: 'uploading',
      file,
      error: null,
    });
    setPortfolioLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze portfolio');
      }

      setPortfolio(data);
      setPortfolioLoading(false);

      setUploadStatus({
        state: 'success',
        file,
        error: null,
      });

      // Delay navigation to show success state
      setTimeout(() => {
        router.push('/results');
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setPortfolioLoading(false);
      setUploadStatus({
        state: 'error',
        file: null,
        error: errorMessage,
      });
    }
  };

  const resetUpload = () => {
    setUploadStatus({ state: 'idle', file: null, error: null });
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderContent = () => {
    switch (uploadStatus.state) {
      case 'preview':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center w-full animate-fade-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3 w-full">
              <h3 className="text-lg font-semibold">Ready to Upload</h3>
              <div className="bg-muted rounded-lg p-4 text-left">
                <p className="text-sm font-medium truncate">
                  {uploadStatus.filePreview?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadStatus.filePreview?.size}
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={resetUpload}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} className="flex-1 sm:flex-none">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        );

      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center w-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="space-y-2 w-full">
              <h3 className="text-lg font-semibold">Processing...</h3>
              <p className="text-sm text-muted-foreground">
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
          <div className="flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-success-muted animate-success">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Redirecting to your projections...
              </p>
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center w-full animate-fade-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-destructive/10">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2 w-full">
              <h3 className="text-lg font-semibold text-destructive">
                Upload Failed
              </h3>
              <Alert variant="destructive" className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {uploadStatus.error || 'Something went wrong'}
                </AlertDescription>
              </Alert>
            </div>
            <Button variant="outline" onClick={resetUpload}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Different File
            </Button>
            <p className="text-xs text-muted-foreground px-4">
              Make sure your file is a valid Avanza CSV export
            </p>
          </div>
        );

      default: // 'idle'
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? 'bg-primary/10' : 'bg-muted'
              }`}
            >
              <Upload
                className={`w-8 h-8 transition-colors ${
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Portfolio CSV</h3>
              <p className="text-sm text-muted-foreground px-2">
                Drag and drop your Avanza export file here, or click to browse
              </p>
            </div>

            <Button
              variant="outline"
              type="button"
              className="hover:bg-accent transition-colors"
            >
              Browse Files
            </Button>

            <div className="text-xs text-muted-foreground">
              Accepted format:{' '}
              <span className="font-mono font-medium">.csv</span> · Max size:
              5MB
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
        className="sr-only"
        disabled={!isInteractive}
        aria-label="Upload portfolio CSV file"
        id="file-upload"
      />
      <Card
        className={`w-full max-w-xl p-6 sm:p-8 border-2 border-dashed transition-all duration-200 ${
          isInteractive ? 'cursor-pointer' : 'cursor-default'
        } ${
          isDragging && isInteractive
            ? 'border-primary bg-primary/5 shadow-md'
            : uploadStatus.state === 'error'
              ? 'border-destructive/50 bg-destructive/5'
              : uploadStatus.state === 'success'
                ? 'border-success/50 bg-success-muted'
                : uploadStatus.state === 'preview'
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30'
        }`}
        onDragOver={isInteractive ? handleDragOver : undefined}
        onDragLeave={isInteractive ? handleDragLeave : undefined}
        onDrop={isInteractive ? handleDrop : undefined}
        onClick={
          isInteractive && uploadStatus.state === 'idle'
            ? handleClick
            : undefined
        }
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
        aria-label={isInteractive ? 'Upload portfolio CSV file' : undefined}
      >
        {renderContent()}
      </Card>
    </>
  );
}
