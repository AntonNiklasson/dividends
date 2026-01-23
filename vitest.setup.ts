import { vi } from 'vitest';

// Suppress console.warn during tests for cleaner output
// Keep console.error visible to catch real issues
vi.spyOn(console, 'warn').mockImplementation(() => {});
