import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { cache, CACHE_KEYS } from '@/lib/cache';

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

interface CachedSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

// Cache TTL: 24 hours for search results
const SEARCH_CACHE_TTL = 24 * 60 * 60;

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // Normalize query for cache key (lowercase, trimmed)
  const normalizedQuery = query.toLowerCase().trim();
  const cacheKey = `${CACHE_KEYS.STOCK_SEARCH}${normalizedQuery}`;

  // Check cache first
  const cached = await cache.get<CachedSearchResult[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached, cached: true });
  }

  try {
    const result = (await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
    })) as SearchResult;

    const results = (result.quotes || [])
      .filter((q) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map((q) => ({
        symbol: q.symbol || '',
        name: q.shortname || q.longname || q.symbol || '',
        exchange: q.exchange || '',
      }));

    // Cache the results
    await cache.set(cacheKey, results, SEARCH_CACHE_TTL);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
