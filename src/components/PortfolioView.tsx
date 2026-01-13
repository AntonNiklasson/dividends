'use client';

import { useState, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import StockListItem from './StockListItem';
import StockSearch from './StockSearch';
import {
  persistedPortfolioAtom,
  addStockAtom,
  removeStockAtom,
  updateSharesAtom,
  clearPortfolioAtom,
  importStocksAtom,
  addExampleStocksAtom,
} from '@/store/persistedPortfolioAtom';
import { portfolioAtom, portfolioLoadingAtom } from '@/store/portfolioAtom';
import type { AnalyzeResponse, PersistedStock } from '@/lib/types';
import { Plus, Trash2, Upload, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { parseCsv } from '@/lib/parseCsv';

export default function PortfolioView() {
  const [portfolio] = useAtom(persistedPortfolioAtom);
  const addStock = useSetAtom(addStockAtom);
  const removeStock = useSetAtom(removeStockAtom);
  const updateShares = useSetAtom(updateSharesAtom);
  const clearPortfolio = useSetAtom(clearPortfolioAtom);
  const importStocks = useSetAtom(importStocksAtom);
  const addExampleStocks = useSetAtom(addExampleStocksAtom);
  const setPortfolioData = useSetAtom(portfolioAtom);
  const setPortfolioLoading = useSetAtom(portfolioLoadingAtom);

  const [showSearch, setShowSearch] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAddStock = (stock: { ticker: string; name: string; shares: number }) => {
    addStock({
      ticker: stock.ticker,
      name: stock.name,
      shares: stock.shares,
      currency: 'USD',
    });
    setShowSearch(false);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const content = await file.text();
      const parsed = parseCsv(content);

      if (parsed.stocks.length === 0) {
        setImportError('No valid stocks found in CSV');
        return;
      }

      const stocks: PersistedStock[] = parsed.stocks.map((s) => ({
        ticker: s.ticker,
        name: s.name,
        shares: s.shares,
        currency: s.currency,
      }));

      importStocks(stocks);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse CSV');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (portfolio.stocks.length === 0) return;

    setIsAnalyzing(true);
    setPortfolioLoading(true);

    try {
      const response = await fetch('/api/analyze-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stocks: portfolio.stocks }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze portfolio');
      }

      setPortfolioData(data);
      router.push('/results');
    } catch (error) {
      console.error('Analysis failed:', error);
      setImportError(
        error instanceof Error ? error.message : 'Analysis failed'
      );
    } finally {
      setIsAnalyzing(false);
      setPortfolioLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>My Portfolio</CardTitle>
            <span className="text-sm text-muted-foreground">
              {portfolio.stocks.length} stock{portfolio.stocks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {portfolio.stocks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Your portfolio is empty. Add some stocks to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {portfolio.stocks.map((stock) => (
                <StockListItem
                  key={stock.ticker}
                  stock={stock}
                  onUpdateShares={(shares) =>
                    updateShares({ ticker: stock.ticker, shares })
                  }
                  onDelete={() => removeStock(stock.ticker)}
                />
              ))}
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t space-y-3">
          {importError && (
            <p className="text-sm text-destructive">{importError}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowSearch(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="sr-only"
              id="csv-import"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>

            <Button variant="outline" onClick={() => addExampleStocks()}>
              <Sparkles className="w-4 h-4 mr-2" />
              Add Examples
            </Button>

            {portfolio.stocks.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(true)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={portfolio.stocks.length === 0 || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze Dividends
              </>
            )}
          </Button>
        </div>
      </Card>

      {showSearch && (
        <StockSearch onAdd={handleAddStock} onClose={() => setShowSearch(false)} />
      )}

      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowClearConfirm(false)}
        >
          <Card
            className="w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2">Clear Portfolio?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will remove all {portfolio.stocks.length} stocks from your
              portfolio. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  clearPortfolio();
                  setShowClearConfirm(false);
                }}
                className="flex-1"
              >
                Clear All
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
