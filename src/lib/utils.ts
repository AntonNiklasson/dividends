import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Remove common corporate suffixes from stock names to reduce visual clutter.
 * Handles suffixes like Inc, Corporation, Ltd, SA, AG, plc, etc.
 */
export function cleanStockName(name: string): string {
  if (!name) return name;

  // Common corporate suffixes to remove (case-insensitive)
  // Order matters: longer/more specific patterns first
  const suffixes = [
    // Full words with optional leading comma
    'Incorporated',
    'Corporation',
    'Company',
    'Limited',
    'Holdings',
    'Holding',
    'Group',
    // Abbreviations (with and without dots)
    'Inc\\.?',
    'Corp\\.?',
    'Co\\.?',
    'Ltd\\.?',
    'LLC',
    'L\\.L\\.C\\.?',
    'SA',
    'S\\.A\\.?',
    'NV',
    'N\\.V\\.?',
    'AG',
    'SE',
    'plc',
    'PLC',
  ];

  // Build regex pattern - match comma or space followed by suffix at end of string
  // Uses word boundary or end of string to avoid matching partial words
  const suffixPattern = suffixes.join('|');
  const pattern = new RegExp(`[,\\s]+(${suffixPattern})\\s*$`, 'i');

  // Apply cleaning - may need multiple passes for compound suffixes like "Holdings Ltd"
  let cleaned = name.trim();
  let previousCleaned = '';

  while (cleaned !== previousCleaned) {
    previousCleaned = cleaned;
    cleaned = cleaned.replace(pattern, '').trim();
  }

  // If we cleaned everything away, return original
  return cleaned || name;
}
