import { NextRequest, NextResponse } from 'next/server';
import { parseCsv } from '@/lib/parseCsv';
import { fetchBatchDividends } from '@/lib/fetchDividends';
import { calculateProjection } from '@/lib/calculateProjection';
import type { AnalyzeResponse } from '@/lib/types';

/**
 * Creates an error response with proper structure and HTTP status
 */
function createErrorResponse(
  error: string,
  statusCode: number = 500
): NextResponse<AnalyzeResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    } as AnalyzeResponse,
    { status: statusCode }
  );
}

/**
 * POST /api/analyze
 * Accepts CSV file upload and returns portfolio analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Extract file from form data
    const formData = await request.formData();
    const file = formData.get('file');

    // Validate file presence
    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    // Validate file type
    if (!(file instanceof File)) {
      return createErrorResponse('Invalid file format', 400);
    }

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return createErrorResponse(
        'Invalid file type. Please upload a CSV file',
        400
      );
    }

    // Validate file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse('File too large. Maximum size is 5MB', 413);
    }

    // Validate file is not empty
    if (file.size === 0) {
      return createErrorResponse('File is empty', 400);
    }

    // Read file content as text
    let csvContent: string;
    try {
      csvContent = await file.text();
    } catch {
      return createErrorResponse('Failed to read file content', 400);
    }

    // Parse CSV
    let parsedPortfolio;
    try {
      parsedPortfolio = parseCsv(csvContent);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to parse CSV file';
      return createErrorResponse(message, 400);
    }

    // Check if parsing resulted in critical errors (no valid stocks found)
    if (
      parsedPortfolio.errors.length > 0 &&
      parsedPortfolio.stocks.length === 0
    ) {
      return createErrorResponse(parsedPortfolio.errors.join('; '), 400);
    }

    // Fetch dividend data for all stocks
    let dividendData;
    try {
      dividendData = await fetchBatchDividends(parsedPortfolio.stocks);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch dividend data';
      return createErrorResponse(message, 500);
    }

    // Combine parsing errors with dividend fetching errors
    const allErrors = [
      ...parsedPortfolio.errors.map((error) => ({
        ticker: 'UNKNOWN',
        error,
      })),
      ...dividendData.errors,
    ];

    // Calculate 3-year projection with DRIP
    const projection = calculateProjection(dividendData.successfulStocks);

    // Return portfolio with dividend data and projection
    return NextResponse.json(
      {
        success: true,
        portfolio: {
          stocks: dividendData.successfulStocks,
          errors: allErrors,
        },
        projection,
      } as AnalyzeResponse,
      { status: 200 }
    );
  } catch (error) {
    // Catch-all for unexpected errors
    console.error('Unexpected error in /api/analyze:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return createErrorResponse(message, 500);
  }
}
