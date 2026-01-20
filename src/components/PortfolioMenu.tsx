'use client';

import { useState, useRef, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  activePortfolioAtom,
  allPortfoliosAtom,
  renamePortfolioAtom,
  deletePortfolioAtom,
  duplicatePortfolioAtom,
} from '@/store/persistedPortfolioAtom';
import { MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';

export function PortfolioMenu() {
  const activePortfolio = useAtomValue(activePortfolioAtom);
  const allPortfolios = useAtomValue(allPortfoliosAtom);
  const renamePortfolio = useSetAtom(renamePortfolioAtom);
  const deletePortfolio = useSetAtom(deletePortfolioAtom);
  const duplicatePortfolio = useSetAtom(duplicatePortfolioAtom);

  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newName, setNewName] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canDelete = allPortfolios.length > 1;

  const startRenaming = () => {
    setNewName(activePortfolio.name);
    setIsRenaming(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsRenaming(false);
        setIsDeleting(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when renaming
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== activePortfolio.name) {
      renamePortfolio({ portfolioId: activePortfolio.id, name: trimmedName });
    }
    setIsRenaming(false);
    setIsOpen(false);
  };

  const handleDelete = () => {
    deletePortfolio(activePortfolio.id);
    setIsDeleting(false);
    setIsOpen(false);
  };

  const handleDuplicate = () => {
    duplicatePortfolio(activePortfolio.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Portfolio options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-48 z-50 p-1.5 shadow-lg">
          {isRenaming ? (
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="w-full px-2.5 py-1.5 text-sm border rounded-md bg-background"
                placeholder="Portfolio name"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleRename} className="flex-1">
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRenaming(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : isDeleting ? (
            <div className="p-2">
              <p className="text-sm mb-3">
                Delete &quot;{activePortfolio.name}&quot;? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDeleting(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={startRenaming}
                className="w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-md hover:bg-accent text-left"
              >
                <Pencil className="w-4 h-4 shrink-0" />
                <span>Rename</span>
              </button>

              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-md hover:bg-accent text-left"
              >
                <Copy className="w-4 h-4 shrink-0" />
                <span>Duplicate</span>
              </button>

              <div className="border-t my-1.5" />

              <button
                onClick={() => setIsDeleting(true)}
                disabled={!canDelete}
                className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-md text-left ${
                  canDelete
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Delete</span>
                {!canDelete && (
                  <span className="text-xs ml-auto">(last)</span>
                )}
              </button>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
