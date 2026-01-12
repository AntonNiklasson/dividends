import { atom } from 'jotai';
import type { AnalyzeResponse } from '@/lib/types';

export const portfolioAtom = atom<AnalyzeResponse | null>(null);
