import { NextRequest, NextResponse } from 'next/server';
import { fetchDividends } from '@/lib/fetchDividends';
import { detectFrequency } from '@/lib/dividendFrequency';
import type { FrequencyInfo } from '@/lib/types';

export interface DividendInfoResponse {
  ticker: string;
  frequencyInfo: FrequencyInfo | null;
  hasDividends: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json(
      { error: 'Missing ticker parameter' },
      { status: 400 }
    );
  }

  try {
    const result = await fetchDividends(ticker);

    if (result.error && result.dividends.length === 0) {
      return NextResponse.json({
        ticker,
        frequencyInfo: null,
        hasDividends: false,
        error: result.error,
      } satisfies DividendInfoResponse);
    }

    const hasDividends = result.dividends.length > 0;
    const frequencyInfo = hasDividends
      ? detectFrequency(result.dividends)
      : null;

    return NextResponse.json({
      ticker,
      frequencyInfo,
      hasDividends,
    } satisfies DividendInfoResponse);
  } catch (error) {
    console.error('Dividend info fetch error:', error);
    return NextResponse.json(
      {
        ticker,
        frequencyInfo: null,
        hasDividends: false,
        error: 'Failed to fetch dividend info',
      } satisfies DividendInfoResponse,
      { status: 500 }
    );
  }
}
