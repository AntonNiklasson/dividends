# Claude Code Instructions

See [README.md](./README.md) for project overview, features, and structure.

## Quick Commands

```bash
npm run dev               # Start dev server (port 4000)
npm run build             # Production build
npm run lint              # ESLint
npm run format            # Prettier
npm test                  # Unit tests (Vitest)
npm run test:integration  # Integration tests (Playwright)
```

## Code Patterns

### API Routes
- Located in `src/app/api/`
- Use Next.js App Router conventions
- Return JSON with `{ success: boolean, data?, error? }` pattern

### State Management
- Jotai atoms in `src/store/`
- `portfolioAtom` - current working portfolio
- `persistedPortfolioAtom` - localStorage sync

### Types
- All TypeScript types defined in `src/lib/types.ts`
- Key types: `PersistedStock`, `StockWithDividends`, `ProjectionResponse`

### Components
- UI primitives in `src/components/ui/` (shadcn/ui style)
- Feature components directly in `src/components/`

### Exports
- Use named exports (not default exports)
- Exceptions: Next.js pages/layouts and config files require default exports
- ESLint enforces this via `import/no-default-export`

## Testing

### Unit Tests
- Co-located with source: `*.test.ts` next to implementation
- Run specific file: `npm test -- src/lib/cache.test.ts`

### Integration Tests
- Located in `tests/integration/`
- Browser tests using Playwright
- Uses `webServer` config to auto-start dev server

## External Data

- Stock data fetched from Yahoo Finance via `yahoo-finance2`
- Exchange rates fetched for currency conversion
- Results cached in `src/lib/cache.ts`
