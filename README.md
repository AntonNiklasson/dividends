# Dividend Portfolio Projector

A web app for projecting dividend income over 3 years with automatic DRIP (Dividend Reinvestment Plan) calculations.

## Features

- **Portfolio Management**: Add stocks by searching tickers or importing from Avanza CSV exports
- **Dividend Projection**: View projected dividend payments month-by-month for 3 years
- **DRIP Simulation**: Automatically reinvests dividends to show compounding growth
- **Multi-currency Support**: Handles stocks in different currencies (USD, SEK, EUR, etc.)
- **Stock Suggestions**: Recommends dividend stocks to fill gaps in months with low payouts
- **Local Storage**: Portfolios persist in browser localStorage

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Jotai
- **Data**: yahoo-finance2 for stock/dividend data
- **Charts**: Recharts
- **Testing**: Vitest (unit), Playwright (E2E)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (port 4000)
npm run dev

# Open http://localhost:4000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 4000 |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm test` | Run unit tests |
| `npm run e2e` | Run Playwright E2E tests |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── analyze/          # Single stock analysis
│   │   ├── analyze-portfolio/# Full portfolio projection
│   │   ├── dividend-info/    # Dividend schedule lookup
│   │   └── search/           # Stock ticker search
│   ├── results/       # Results page
│   └── page.tsx       # Home page
├── components/        # React components
├── lib/               # Utilities and business logic
│   ├── calculateProjection.ts  # DRIP projection engine
│   ├── fetchDividends.ts       # Yahoo Finance integration
│   ├── dividendFrequency.ts    # Frequency detection
│   └── types.ts                # TypeScript types
└── store/             # Jotai atoms for state
```

## API Routes

- `POST /api/analyze` - Analyze a single stock
- `POST /api/analyze-portfolio` - Analyze full portfolio with projections
- `GET /api/search?q=` - Search for stock tickers
- `GET /api/dividend-info?ticker=` - Get dividend schedule for a ticker
