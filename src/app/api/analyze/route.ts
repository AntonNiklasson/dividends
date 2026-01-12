import { NextRequest, NextResponse } from 'next/server';
import { parseCsv } from '@/lib/parseCsv';
import type { AnalyzeResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content as text
    const csvContent = await file.text();

    // Parse CSV
    const parsedPortfolio = parseCsv(csvContent);

    // If there are critical errors, return error response
    if (
      parsedPortfolio.errors.length > 0 &&
      parsedPortfolio.stocks.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: parsedPortfolio.errors.join('; '),
        } as AnalyzeResponse,
        { status: 400 }
      );
    }

    // Return parsed portfolio (projection will be added in later phases)
    return NextResponse.json({
      success: true,
      portfolio: {
        stocks: parsedPortfolio.stocks.map((stock) => ({
          ticker: stock.ticker,
          name: stock.name,
          initialShares: stock.shares,
          currency: stock.currency,
          currentPrice: 0, // Will be fetched in Phase 26
          dividendSchedule: [], // Will be fetched in Phase 25
          hasDividends: true, // Will be determined in Phase 27
        })),
        errors: parsedPortfolio.errors.map((error) => ({
          ticker: 'UNKNOWN',
          error,
        })),
      },
    } as AnalyzeResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      } as AnalyzeResponse,
      { status: 500 }
    );
  }
}
