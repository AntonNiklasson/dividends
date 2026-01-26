# Dividend Portfolio Projector

Project your dividend income over 3 years with automatic DRIP (Dividend Reinvestment Plan) calculations.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **3-Year Projections** — See month-by-month dividend payments with DRIP compounding
- **Multi-Currency** — Handles USD, SEK, EUR, and other currencies
- **Portfolio Import** — Search tickers or import from Avanza CSV exports
- **Local Storage** — Portfolios persist in your browser

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:4000
```

## Scripts

```bash
npm run dev               # Dev server (port 4000)
npm run build             # Production build
npm run lint              # Fast lint (oxlint)
npm run lint:strict       # Full lint (ESLint)
npm test                  # Unit tests
npm run test:integration  # E2E tests (Playwright)
```

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── analyze/            # Single stock analysis
│   │   ├── analyze-portfolio/  # Full portfolio projection
│   │   ├── dividend-info/      # Dividend schedule lookup
│   │   └── search/             # Ticker search
│   ├── results/                # Results page
│   └── page.tsx                # Home page
├── components/                 # React components
├── lib/                        # Business logic
│   ├── calculateProjection.ts  # DRIP projection engine
│   ├── fetchDividends.ts       # Yahoo Finance integration
│   └── types.ts                # TypeScript types
└── store/                      # Jotai atoms
```

## Tech Stack

- **Next.js 16** — App Router with Turbopack
- **Jotai** — State management
- **yahoo-finance2** — Stock and dividend data
- **Recharts** — Visualization
- **Vitest + Playwright** — Testing

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search?q=` | GET | Search stock tickers |
| `/api/dividend-info?ticker=` | GET | Get dividend schedule |
| `/api/analyze` | POST | Analyze single stock |
| `/api/analyze-portfolio` | POST | Full portfolio projection |
