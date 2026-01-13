import { NextRequest, NextResponse } from 'next/server';
import { fetchBatchDividends } from '@/lib/fetchDividends';
import { calculateProjection } from '@/lib/calculateProjection';
import type { AnalyzeResponse, PortfolioStock } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { stocks } = await request.json();

    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No stocks provided' },
        { status: 400 }
      );
    }

    // Convert to PortfolioStock format
    const portfolioStocks: PortfolioStock[] = stocks.map((s: { ticker: string; name: string; shares: number; currency: string }) => ({
      ticker: s.ticker,
      name: s.name,
      shares: s.shares,
      currency: s.currency || 'USD',
      isin: '',
      type: 'STOCK',
    }));

    // Fetch dividend data
    const dividendData = await fetchBatchDividends(portfolioStocks);

    // Calculate projection
    const projection = calculateProjection(dividendData.successfulStocks);

    return NextResponse.json({
      success: true,
      portfolio: {
        stocks: dividendData.successfulStocks,
        errors: dividendData.errors,
      },
      projection,
    } as AnalyzeResponse);
  } catch (error) {
    console.error('Error in /api/analyze-portfolio:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}
