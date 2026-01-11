# Dividend Portfolio Projector — Product Requirements Document

**Version:** 1.0 (MVP)  
**Last Updated:** January 2026

---

## Overview

Dividend Portfolio Projector is a web application that allows users to upload a CSV file (exported from Avanza) containing their stock portfolio and receive a multi-year projection of expected dividend income. The tool assumes all dividends are reinvested (DRIP) and shows how the portfolio's dividend income could grow over a 3-year period.

---

## Problem Statement

Investors who hold dividend-paying stocks often want to understand their future cash flow from dividends. Bank exports provide current holdings but don't project forward. Manually researching dividend schedules and calculating reinvestment scenarios is tedious and error-prone.

---

## Solution

A simple upload-and-analyze tool that:

1. Accepts a CSV file with stock holdings (Avanza export format)
2. Fetches historical dividend data for each stock
3. Projects dividend income for 2026, 2027, and 2028
4. Assumes dividends are reinvested to purchase additional shares
5. Displays a monthly breakdown showing totals and per-stock payouts

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui (built on Radix UI primitives) |
| State Management | Jotai |
| Testing | Vitest (unit/integration), Playwright (E2E) |
| Formatting | Prettier |
| Linting | ESLint |
| CSV Parsing | papaparse |
| Dividend Data | Yahoo Finance API (via yahoo-finance2 or similar) |

### Note on shadcn/ui

shadcn/ui is not a traditional npm dependency—it copies component source code directly into your project (`components/ui/`). This gives full ownership and customization ability. Components are installed via CLI:

```bash
npx shadcn@latest init          # Initialize in project
npx shadcn@latest add button    # Add individual components
```

**Components we'll use:**
- `Button` — Primary actions, navigation
- `Card` — Month cards, summary panels
- `Tabs` — Year selection (2026/2027/2028)
- `Collapsible` — Expand/collapse stock details per month
- `Alert` — Error banners, warnings for invalid tickers
- `Progress` — Loading indicator during analysis
- `Skeleton` — Loading placeholders

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. UPLOAD                                                      │
│     User uploads CSV file with portfolio data (Avanza export)   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. VALIDATE                                                    │
│     System checks file structure and required columns           │
│     - Success: proceed to analysis                              │
│     - Failure: show specific error message                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. FETCH                                                       │
│     For each ticker, fetch dividend history from Yahoo Finance  │
│     - Success: include in projection                            │
│     - Failure: show error for that ticker                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. PROJECT                                                     │
│     Calculate 3-year projection with DRIP reinvestment          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. DISPLAY                                                     │
│     Show yearly tabs with monthly breakdown                     │
│     - Total dividend per month                                  │
│     - Expandable detail: which stocks pay out each month        │
└─────────────────────────────────────────────────────────────────┘
```

---

## CSV File Format (Avanza Export)

### Format Details

- **Delimiter:** Semicolon (`;`)
- **Decimal separator:** Comma (`,`) for Swedish locale
- **Encoding:** UTF-8 with BOM

### Columns

| Column | Description | Example |
|--------|-------------|---------|
| `Kontonummer` | Account number | `1234567` |
| `Namn` | Full name of holding | `Apple` |
| `Kortnamn` | Ticker/short name | `AAPL` |
| `Volym` | Number of shares | `14` or `12,1` |
| `Marknadsvärde` | Market value in SEK | `3506,67` |
| `GAV (SEK)` | Average acquisition cost in SEK | `247,76` |
| `GAV` | Average acquisition cost in original currency | `247,76` |
| `Valuta` | Currency | `SEK`, `USD` |
| `Land` | Country code | `SE`, `US` |
| `ISIN` | ISIN code | `SE0000108227` |
| `Marknad` | Market | `XSTO`, `XNAS`, `XNYS` |
| `Typ` | Type | `STOCK`, `FUND`, `EXCHANGE_TRADED_FUND` |

### Key Fields for Dividend Projection

- **`Kortnamn`**: Used as ticker symbol for dividend lookup
- **`Volym`**: Number of shares held
- **`Valuta`**: Currency for display
- **`Typ`**: Filter to only include `STOCK` and `EXCHANGE_TRADED_FUND` (funds don't pay traditional dividends)
- **`ISIN`**: Can be used for more reliable stock identification

### Example File

```csv
Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;SKF B;SKF B;14;3506,67;247,76;247,76;SEK;SE;SE0000108227;XSTO;STOCK
1234567;Apple;AAPL;1;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK
1234567;Avanza Global;Avanza Global;72,0;16491,36;193,02;193,02;SEK;SE;SE0011527613;FUND;FUND
```

---

## Dividend Data & Projection Logic

### Data Source

- **Primary:** Yahoo Finance via `yahoo-finance2` npm package
- Fetch via Next.js API routes (server-side only)

### Historical Data Used

- Fetch last 12 months of dividend payments per stock
- Extract: payment dates, dividend per share, currency

### Handling Non-Dividend Stocks

- If a stock has no dividend payments in the last 12 months, it is **not included in calculations**
- These stocks are still displayed in the results with a note: "No dividend history found"
- This covers growth stocks (AMZN, TSLA, etc.) and companies that recently suspended dividends
- We do not look further back than 12 months for MVP

### Projection Algorithm

```
For each year (2026, 2027, 2028):
  For each stock:
    1. Use last year's dividend schedule (dates and amounts) as template
    2. Calculate expected dividend = shares × dividend_per_share
    3. After each dividend payment, calculate reinvested shares:
       reinvested_shares = dividend_amount / current_stock_price
    4. Add reinvested shares to total for next dividend calculation
    
  Aggregate by month across all stocks
```

### Assumptions

- Dividend amounts remain the same as the previous year
- Dividends are reinvested at the current stock price (fetched once at analysis time)
- Payment dates follow the same schedule as previous year

### Currency Handling

- Display dividends in their native currency (USD, EUR, CHF, etc.)
- Group totals shown per currency
- No currency conversion in MVP

---

## UI/UX Specification

### Page: Home / Upload

**Layout:**
- Clean, centered layout
- App title and brief description
- Drag-and-drop upload zone (also supports click-to-browse)
- Accepted format indicator: `.csv` (Avanza export)

**States:**
- Default: empty upload zone
- Dragging: highlighted border
- Uploading: progress indicator
- Error: red border with error message

### Page: Results

**Layout:**
- Header with option to upload new file
- Year tabs: 2026 | 2027 | 2028
- Monthly breakdown grid/list

**Monthly View:**
- 12 months displayed as cards or rows
- Each month shows:
  - Month name
  - Total dividend amount (grouped by currency if multiple)
  - Expandable section with per-stock breakdown

**Per-Stock Detail (expanded):**
- Stock ticker
- Dividend amount
- Payment date (approximate)
- Shares held at time of payment
- Currency

**Example:**

```
┌─────────────────────────────────────────────────────────────┐
│  JANUARY 2026                                    ▼ Expand   │
│  Total: $245.00 USD, €50.00 EUR                            │
├─────────────────────────────────────────────────────────────┤
│  AAPL    $120.00   Jan 15   52.3 shares   USD              │
│  MSFT    $125.00   Jan 22   31.2 shares   USD              │
│  NESN.SW  €50.00   Jan 10   25.0 shares   EUR              │
└─────────────────────────────────────────────────────────────┘
```

### Error States

**File Validation Errors:**
- "Missing required column: Kortnamn"
- "Missing required column: Volym"
- "No valid stock data found in file"
- "Invalid CSV format - expected semicolon delimiter"

**Ticker Lookup Errors:**
- Show warning banner: "Could not find dividend data for: XYZ, ABC"
- Continue with remaining valid stocks
- If ALL tickers fail: show error, prompt to check file

---

## API Routes

### `POST /api/analyze`

**Request:**
- Multipart form data with CSV file

**Response (Success):**
```json
{
  "success": true,
  "portfolio": {
    "stocks": [
      {
        "ticker": "AAPL",
        "initialShares": 50,
        "currency": "USD",
        "currentPrice": 185.50,
        "dividendSchedule": [
          { "month": 2, "day": 15, "amount": 0.24 },
          { "month": 5, "day": 15, "amount": 0.24 },
          { "month": 8, "day": 15, "amount": 0.24 },
          { "month": 11, "day": 15, "amount": 0.24 }
        ]
      }
    ],
    "errors": [
      { "ticker": "INVALID", "error": "Ticker not found" }
    ]
  },
  "projection": {
    "2026": {
      "months": [
        {
          "month": 1,
          "total": { "USD": 245.00, "EUR": 50.00 },
          "payments": [
            {
              "ticker": "AAPL",
              "amount": 120.00,
              "currency": "USD",
              "date": "2026-01-15",
              "sharesAtPayment": 52.3
            }
          ]
        }
      ],
      "yearTotal": { "USD": 2500.00, "EUR": 600.00 }
    },
    "2027": { ... },
    "2028": { ... }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required column: shares"
}
```

---

## Project Structure

```
dividend-projector/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home/upload page
│   │   ├── results/
│   │   │   └── page.tsx             # Results page
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts         # Analysis endpoint
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── FileUpload.tsx
│   │   ├── YearTabs.tsx
│   │   ├── MonthCard.tsx
│   │   ├── StockPaymentRow.tsx
│   │   └── ErrorBanner.tsx
│   ├── lib/
│   │   ├── parseCsv.ts              # CSV parsing logic (Avanza format)
│   │   ├── fetchDividends.ts        # Yahoo Finance integration
│   │   ├── calculateProjection.ts   # DRIP projection logic
│   │   └── types.ts                 # TypeScript interfaces
│   └── store/
│       └── portfolioAtom.ts         # Jotai atoms
├── tests/
│   ├── unit/
│   │   ├── parseCsv.test.ts
│   │   ├── calculateProjection.test.ts
│   │   └── fetchDividends.test.ts
│   └── e2e/
│       └── upload-flow.spec.ts
├── public/
│   └── sample-portfolio.csv         # Example file for users
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.js
├── .prettierrc
└── package.json
```

---

## Testing Strategy

### Unit Tests (Vitest)

- **parseCsv.ts**: Avanza CSV format, missing columns, malformed data, decimal parsing
- **calculateProjection.ts**: DRIP math, edge cases (fractional shares, missing dividends)
- **fetchDividends.ts**: Mock Yahoo Finance responses, error handling

### Integration Tests (Vitest)

- API route with mock file uploads
- End-to-end data flow from parse → fetch → calculate

### E2E Tests (Playwright)

- Upload valid file → see results
- Upload invalid file → see appropriate error
- Navigate between year tabs
- Expand/collapse month details

---

## Out of Scope (MVP)

These features are explicitly not included in V1 but are candidates for future versions:

- [ ] User accounts and saved portfolios
- [ ] Currency conversion to base currency
- [ ] Custom date range selection
- [ ] Dividend data caching
- [ ] Manual dividend entry/override
- [ ] Export projection to PDF/Excel
- [ ] Dark mode
- [ ] Mobile-optimized layout (basic responsiveness only)
- [ ] Historical accuracy tracking (projected vs actual)

---

## Open Questions

1. **Rate limiting:** Yahoo Finance may rate-limit requests. For MVP, we proceed without caching. If issues arise, consider:
   - Server-side caching with TTL
   - Batch requests
   - Alternative data source

2. **Stock price for reinvestment:** Currently using price at analysis time. Should we estimate future prices or just use current? (Current approach is simpler and clearly an estimate.)

3. **Fractional shares:** Assume brokers support fractional shares for DRIP. Display to 2 decimal places.

---

## Success Metrics

For MVP, success is defined qualitatively:

- User can upload a file and see a projection in under 10 seconds
- Projection numbers are reasonable and explainable
- Error messages are clear and actionable
- App feels fast and responsive

---

## Implementation Plan

See the separate **Implementation Plan** document for a detailed breakdown of 59 atomic tasks, each designed to be a single git commit / Claude Code session.
