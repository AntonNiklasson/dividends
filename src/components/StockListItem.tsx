'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Trash2, Check, X } from 'lucide-react';
import type { PersistedStock, FrequencyInfo } from '@/lib/types';
import { formatFrequency } from '@/lib/dividendFrequency';

interface StockListItemProps {
  stock: PersistedStock;
  onUpdateShares: (shares: number) => void;
  onDelete: () => void;
  frequencyInfo?: FrequencyInfo;
}

export default function StockListItem({
  stock,
  onUpdateShares,
  onDelete,
  frequencyInfo,
}: StockListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(stock.shares.toString());

  const handleSave = () => {
    const newShares = parseInt(editValue, 10);
    if (!isNaN(newShares) && newShares > 0) {
      onUpdateShares(newShares);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(stock.shares.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{stock.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{stock.ticker}</p>
          {frequencyInfo && frequencyInfo.months.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {formatFrequency(frequencyInfo)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-20 px-2 py-1 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <Button size="icon-sm" variant="ghost" onClick={handleSave}>
              <Check className="w-4 h-4 text-success" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            {stock.shares} shares
          </button>
        )}

        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
