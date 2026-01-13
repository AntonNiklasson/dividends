import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

interface SearchQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
}

interface SearchResult {
  quotes?: SearchQuote[];
}

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const result = (await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
    })) as SearchResult;

    const results = (result.quotes || [])
      .filter(
        (q) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF'
      )
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
