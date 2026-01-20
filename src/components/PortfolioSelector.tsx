'use client';

import { useState, useRef, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  activePortfolioAtom,
  allPortfoliosAtom,
  switchPortfolioAtom,
  createPortfolioAtom,
} from '@/store/persistedPortfolioAtom';
import { ChevronDown, Check, Plus, FolderOpen } from 'lucide-react';
import { PortfolioMenu } from './PortfolioMenu';

export function PortfolioSelector() {
  const activePortfolio = useAtomValue(activePortfolioAtom);
  const allPortfolios = useAtomValue(allPortfoliosAtom);
  const switchPortfolio = useSetAtom(switchPortfolioAtom);
  const createPortfolio = useSetAtom(createPortfolioAtom);
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Disable switching on results page
  const isResultsPage = pathname === '/results';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (portfolioId: string) => {
    switchPortfolio(portfolioId);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    createPortfolio();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => !isResultsPage && setIsOpen(!isOpen)}
          className={`min-w-[180px] justify-between ${isResultsPage ? 'cursor-default' : ''}`}
          disabled={isResultsPage}
        >
          <span className="flex items-center gap-2 truncate">
            <FolderOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">{activePortfolio.name}</span>
          </span>
          {!isResultsPage && (
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </Button>
        {!isResultsPage && <PortfolioMenu />}
      </div>

      {isOpen && !isResultsPage && (
        <Card className="absolute right-0 top-full mt-2 w-64 z-50 p-1 shadow-lg">
          <div className="max-h-64 overflow-y-auto">
            {allPortfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => handleSwitch(portfolio.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
              >
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  {portfolio.id === activePortfolio.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </span>
                <span className="truncate flex-1">{portfolio.name}</span>
                <span className="text-muted-foreground text-xs">
                  {portfolio.stocks.length} stock{portfolio.stocks.length !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t mt-1 pt-1">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
              <span>New Portfolio</span>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
