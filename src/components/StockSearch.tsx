'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import type { FrequencyInfo } from '@/lib/types';
import { formatFrequency } from '@/lib/dividendFrequency';

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

interface StockSearchProps {
  onAdd: (stock: {
    ticker: string;
    name: string;
    shares: number;
    frequencyInfo?: FrequencyInfo;
  }) => void;
  onClose: () => void;
}

export function StockSearch({ onAdd, onClose }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [shares, setShares] = useState('10');
  const [frequencyInfo, setFrequencyInfo] = useState<FrequencyInfo | null>(null);
  const [isLoadingFrequency, setIsLoadingFrequency] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 1) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = async (result: SearchResult) => {
    setSelected(result);
    setQuery('');
    setResults([]);
    setFrequencyInfo(null);
    setIsLoadingFrequency(true);

    try {
      const res = await fetch(
        `/api/dividend-info?ticker=${encodeURIComponent(result.symbol)}`
      );
      const data = await res.json();
      if (data.frequencyInfo) {
        setFrequencyInfo(data.frequencyInfo);
      }
    } catch {
      // Ignore errors - frequency is optional
    } finally {
      setIsLoadingFrequency(false);
    }
  };

  const handleAdd = () => {
    if (!selected) return;
    const numShares = parseInt(shares, 10);
    if (isNaN(numShares) || numShares <= 0) return;

    onAdd({
      ticker: selected.symbol,
      name: selected.name,
      shares: numShares,
      frequencyInfo: frequencyInfo ?? undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selected) {
        setSelected(null);
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[15vh] z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md mx-4 p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {selected ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add Stock</h3>
              <Button size="icon-sm" variant="ghost" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <p className="font-medium">{selected.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{selected.symbol}</p>
                {isLoadingFrequency && (
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                )}
                {!isLoadingFrequency && frequencyInfo && frequencyInfo.months.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatFrequency(frequencyInfo)}
                  </span>
                )}
                {!isLoadingFrequency && (!frequencyInfo || frequencyInfo.months.length === 0) && (
                  <span className="text-xs text-muted-foreground/60">No dividends</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of shares</label>
              <input
                type="number"
                min="1"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleAdd} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add to Portfolio
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search stocks by name or symbol..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 && query.length > 0 && !isLoading && (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No results found
                </p>
              )}
              {results.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                >
                  <p className="font-medium">{result.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.symbol} · {result.exchange}
                  </p>
                </button>
              ))}
              {query.length === 0 && (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  Start typing to search
                </p>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
