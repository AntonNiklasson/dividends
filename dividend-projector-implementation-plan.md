# Dividend Portfolio Projector — Implementation Plan

**Related Document:** dividend-projector-prd.md  
**Version:** 1.2  
**Last Updated:** January 2026

---

## Overview

This document breaks down the implementation into atomic tasks. Each phase is designed to be:

- **One focused task** (single responsibility)
- **One git commit** (with a suggested commit message)
- **Completable in one Claude Code session**

---

## How to Use This Plan

1. **Before each phase**, briefly review the PRD for context on what you're building
2. **Each phase is self-contained** — complete it fully before moving on
3. **Verify completion** by running the app/tests and confirming the feature works
4. **Commit after each phase** with the suggested message (or similar)

When starting a Claude Code session, provide:

- The PRD (for overall context)
- The specific phase(s) you want to complete
- Any relevant code from previous phases if needed

---

## Phase Summary

| Section                  | Phases | Count |
| ------------------------ | ------ | ----- |
| Project Setup            | 1–10   | 10    |
| File Upload UI           | 11–16  | 6     |
| CSV Parsing              | 17–21  | 5     |
| API Route Foundation     | 22–24  | 3     |
| Dividend Data Fetching   | 25–29  | 5     |
| Projection Engine        | 30–36  | 7     |
| Results UI               | 37–46  | 10    |
| Integration & Navigation | 47–50  | 4     |
| Polish                   | 51–55  | 5     |
| Testing                  | 56–59  | 4     |

**Total: 59 phases**

---

## Project Setup

### Phase 1: Initialize Next.js project

- Run `create-next-app` with TypeScript and App Router
- Verify dev server runs
- Commit: "Initialize Next.js project with TypeScript"

### Phase 2: Configure Tailwind CSS

- Install and configure Tailwind
- Add to globals.css
- Test with a simple styled element
- Commit: "Add Tailwind CSS configuration"

### Phase 3: Initialize shadcn/ui

- Run `npx shadcn@latest init`
- Choose style preset (Default or New York)
- Configure components.json
- Verify components/ui directory is created
- Commit: "Initialize shadcn/ui"

### Phase 4: Configure ESLint

- Set up ESLint with recommended Next.js rules
- Add any custom rules (e.g., no unused vars as error)
- Commit: "Configure ESLint"

### Phase 5: Configure Prettier

- Install Prettier
- Add .prettierrc with project settings
- Add format script to package.json
- Ensure ESLint and Prettier don't conflict
- Commit: "Configure Prettier"

### Phase 6: Configure Vitest

- Install Vitest and dependencies
- Create vitest.config.ts
- Add a placeholder test to verify setup
- Add test script to package.json
- Commit: "Configure Vitest for unit testing"

### Phase 7: Configure Playwright

- Install Playwright
- Create playwright.config.ts
- Add a placeholder E2E test
- Add e2e script to package.json
- Commit: "Configure Playwright for E2E testing"

### Phase 8: Install Jotai

- Install Jotai
- Create store folder structure
- Commit: "Add Jotai for state management"

### Phase 9: Set up project folder structure

- Create empty folder structure (components/, lib/, store/, tests/)
- Add placeholder index files or .gitkeep as needed
- Commit: "Set up project folder structure"

### Phase 10: Add base shadcn/ui components

- Install foundational components: `npx shadcn@latest add button card`
- Verify components appear in components/ui/
- Commit: "Add Button and Card shadcn components"

---

## File Upload UI

### Phase 11: Create app layout

- Build root layout with basic styling
- Add app title/header using shadcn Card for container
- Center content container
- Commit: "Create base app layout"

### Phase 12: Create FileUpload component (static)

- Build drag-and-drop zone UI (no functionality yet)
- Style with Tailwind and shadcn Card
- Show accepted file types
- Commit: "Add FileUpload component UI"

### Phase 13: Add drag-and-drop functionality

- Implement onDrop and onDragOver handlers
- Add visual feedback for drag states
- Commit: "Implement drag-and-drop file handling"

### Phase 14: Add click-to-browse functionality

- Add hidden file input
- Trigger on zone click
- Use shadcn Button for browse action
- Commit: "Add click-to-browse file selection"

### Phase 15: Add upload state management

- Create Jotai atom for upload state (idle, uploading, success, error)
- Update FileUpload to use atom
- Show appropriate UI for each state
- Commit: "Add upload state management with Jotai"

### Phase 16: Add client-side file validation

- Install shadcn Alert and Progress: `npx shadcn@latest add alert progress`
- Check file extension (.csv)
- Check file size (reasonable limit, e.g., 5MB)
- Show error state using shadcn Alert for invalid files
- Commit: "Add client-side file validation with shadcn Alert"

---

## CSV Parsing

### Phase 17: Create TypeScript types

- Define types in lib/types.ts: PortfolioStock, ParsedPortfolio, AvanzaRow, etc.
- Commit: "Define TypeScript types for portfolio data"

### Phase 18: Implement parseCsv function

- Install papaparse: `npm install papaparse @types/papaparse`
- Create lib/parseCsv.ts
- Parse with semicolon delimiter
- Handle Swedish decimal format (comma → dot)
- Extract rows into objects
- Commit: "Implement CSV parsing with papaparse"

### Phase 19: Map Avanza columns to portfolio data

- Map `Kortnamn` → ticker
- Map `Volym` → shares (parse Swedish decimals)
- Map `Valuta` → currency
- Map `Typ` → filter STOCK and EXCHANGE_TRADED_FUND only
- Map `ISIN` → for reliable stock identification
- Commit: "Map Avanza CSV columns to portfolio data"

### Phase 20: Add parse validation

- Check for required columns (Kortnamn, Volym)
- Validate shares are valid numbers after decimal conversion
- Return structured errors
- Commit: "Add CSV parse validation"

### Phase 21: Write parseCsv unit tests

- Test valid Avanza CSV parsing
- Test missing columns
- Test Swedish decimal parsing (12,5 → 12.5)
- Test filtering by Typ (exclude FUND)
- Test invalid data
- Commit: "Add unit tests for parseCsv"

---

## API Route Foundation

### Phase 22: Create analyze API route

- Create app/api/analyze/route.ts
- Accept POST with multipart form data
- Return placeholder response
- Commit: "Create analyze API route scaffold"

### Phase 23: Integrate CSV parsing into API

- Parse uploaded file in API route
- Return parsed portfolio or error
- Commit: "Integrate CSV parsing into API route"

### Phase 24: Add API error handling

- Structured error responses
- HTTP status codes
- Commit: "Add structured API error handling"

---

## Dividend Data Fetching

### Phase 25: Create fetchDividends function

- Install yahoo-finance2: `npm install yahoo-finance2`
- Create lib/fetchDividends.ts
- Fetch dividend history for a single ticker (last 12 months)
- Return structured dividend data
- Commit: "Implement single-ticker dividend fetching with yahoo-finance2"

### Phase 26: Add stock price fetching

- Extend fetchDividends to also return current price
- Needed for DRIP calculations
- Commit: "Add current stock price fetching"

### Phase 27: Add batch ticker fetching

- Create function to fetch multiple tickers
- Handle partial failures (some tickers not found)
- Handle stocks with no dividend history (flag them, don't error)
- Commit: "Implement batch ticker fetching with error handling"

### Phase 28: Write fetchDividends unit tests

- Mock Yahoo Finance responses
- Test successful fetch
- Test ticker not found
- Test stock with no dividends
- Test network errors
- Commit: "Add unit tests for fetchDividends"

### Phase 29: Integrate dividend fetching into API

- Call fetchDividends in analyze route
- Include dividend data in response
- Include per-ticker errors in response
- Flag non-dividend stocks separately
- Commit: "Integrate dividend fetching into API route"

---

## Projection Engine

### Phase 30: Define projection types

- Add types for projection output (YearProjection, MonthProjection, Payment)
- Commit: "Define TypeScript types for projections"

### Phase 31: Implement basic projection (no DRIP)

- Create lib/calculateProjection.ts
- Project dividends for 2026 based on historical schedule
- No reinvestment yet—just multiply shares × dividend
- Skip stocks with no dividend history
- Commit: "Implement basic dividend projection"

### Phase 32: Extend projection to 3 years

- Generate projections for 2026, 2027, 2028
- Still no DRIP
- Commit: "Extend projection to 3 years"

### Phase 33: Implement DRIP calculation

- After each dividend, calculate reinvested shares
- Update share count for subsequent calculations
- Commit: "Implement DRIP reinvestment calculation"

### Phase 34: Aggregate by month

- Sum dividends per month across all stocks
- Group totals by currency
- Commit: "Aggregate projections by month"

### Phase 35: Write projection unit tests

- Test basic projection
- Test DRIP math
- Test multi-year compounding
- Test multiple currencies
- Test handling of non-dividend stocks
- Commit: "Add unit tests for projection calculations"

### Phase 36: Integrate projection into API

- Call calculateProjection in analyze route
- Return full projection in API response
- Commit: "Integrate projection engine into API route"

---

## Results UI

### Phase 37: Add shadcn Tabs and Collapsible components

- Install: `npx shadcn@latest add tabs collapsible`
- Commit: "Add Tabs and Collapsible shadcn components"

### Phase 38: Create results page

- Create app/results/page.tsx
- Basic layout structure
- Commit: "Create results page scaffold"

### Phase 39: Create portfolio Jotai atom

- Store API response in Jotai
- Create atom for projection data
- Commit: "Create Jotai atoms for projection data"

### Phase 40: Create YearTabs component

- Use shadcn Tabs for 2026, 2027, 2028
- Track selected year in state
- Commit: "Create YearTabs component with shadcn Tabs"

### Phase 41: Create MonthCard component (static)

- Use shadcn Card for container
- Display month name
- Display total (placeholder data)
- Commit: "Create MonthCard component"

### Phase 42: Create StockPaymentRow component

- Display single stock payment details
- Ticker, amount, date, shares, currency
- Commit: "Create StockPaymentRow component"

### Phase 43: Add expand/collapse to MonthCard

- Use shadcn Collapsible for stock details
- Expand icon/chevron
- Commit: "Add expand/collapse to MonthCard with shadcn Collapsible"

### Phase 44: Wire up results page with real data

- Read from Jotai atoms
- Render MonthCards with actual projection
- Commit: "Connect results page to projection data"

### Phase 45: Create ErrorBanner component

- Use shadcn Alert for warnings about tickers with errors
- Show non-dividend stocks with explanatory note
- Dismissible or persistent (choose one)
- Commit: "Create ErrorBanner component with shadcn Alert"

### Phase 46: Display year totals

- Show total dividends per year at top of tab
- Grouped by currency
- Commit: "Add year total display"

---

## Integration & Navigation

### Phase 47: Connect upload to API

- On file selection, POST to /api/analyze
- Show loading state using shadcn Progress during request
- Commit: "Connect FileUpload to analyze API"

### Phase 48: Navigate to results on success

- On successful API response, store in Jotai
- Navigate to /results
- Commit: "Navigate to results page on success"

### Phase 49: Add "Upload new file" button

- On results page, shadcn Button to link back to home
- Clear previous state
- Commit: "Add navigation back to upload"

### Phase 50: Handle API errors in UI

- Show error state on upload page using shadcn Alert
- Display error message from API
- Commit: "Handle API errors in upload UI"

---

## Polish

### Phase 51: Add loading states

- Install shadcn Skeleton: `npx shadcn@latest add skeleton`
- Use for loading placeholders on results page
- Commit: "Add Skeleton loading states"

### Phase 52: Add empty state for months

- Handle months with no dividends gracefully
- Commit: "Add empty state for months with no dividends"

### Phase 53: Create sample CSV file

- Create public/sample-portfolio.csv (Avanza export format)
- Add download link on upload page
- Commit: "Add sample portfolio file"

### Phase 54: Responsive styling pass

- Ensure upload page works on mobile
- Ensure results page is readable on mobile
- Commit: "Add responsive styling"

### Phase 55: Final styling polish

- Consistent spacing
- Typography refinement
- Hover states
- Commit: "Final styling polish"

---

## Testing

### Phase 56: Write API route integration test

- Test with mock file upload
- Test success and error cases
- Commit: "Add API route integration tests"

### Phase 57: Write E2E test: successful upload flow

- Upload valid file
- Verify results page displays
- Verify data appears correct
- Commit: "Add E2E test for successful upload"

### Phase 58: Write E2E test: error handling

- Upload invalid file
- Verify error message displays
- Commit: "Add E2E test for upload error handling"

### Phase 59: Write E2E test: results interaction

- Navigate between year tabs
- Expand/collapse month cards
- Commit: "Add E2E test for results page interaction"

---

## shadcn/ui Components Summary

Components installed throughout the phases:

| Phase | Components        | CLI Command                              |
| ----- | ----------------- | ---------------------------------------- |
| 10    | Button, Card      | `npx shadcn@latest add button card`      |
| 16    | Alert, Progress   | `npx shadcn@latest add alert progress`   |
| 37    | Tabs, Collapsible | `npx shadcn@latest add tabs collapsible` |
| 51    | Skeleton          | `npx shadcn@latest add skeleton`         |

**All components at once (alternative):**

```bash
npx shadcn@latest add button card alert progress tabs collapsible skeleton
```

---

## npm Packages Summary

| Phase | Package        | Purpose                |
| ----- | -------------- | ---------------------- |
| 8     | jotai          | State management       |
| 18    | papaparse      | CSV file parsing       |
| 25    | yahoo-finance2 | Dividend data fetching |

---

## Progress Tracking

Use this checklist to track completion:

### Project Setup (1–10)

- [x] Phase 1: Initialize Next.js project
- [x] Phase 2: Configure Tailwind CSS
- [x] Phase 3: Initialize shadcn/ui
- [x] Phase 4: Configure ESLint
- [x] Phase 5: Configure Prettier
- [x] Phase 6: Configure Vitest
- [x] Phase 7: Configure Playwright
- [x] Phase 8: Install Jotai
- [x] Phase 9: Set up project folder structure
- [x] Phase 10: Add base shadcn/ui components

### File Upload UI (11–16)

- [x] Phase 11: Create app layout
- [x] Phase 12: Create FileUpload component (static)
- [x] Phase 13: Add drag-and-drop functionality
- [x] Phase 14: Add click-to-browse functionality
- [x] Phase 15: Add upload state management
- [x] Phase 16: Add client-side file validation

### CSV Parsing (17–21)

- [x] Phase 17: Create TypeScript types
- [x] Phase 18: Implement parseCsv function
- [x] Phase 19: Map Avanza columns to portfolio data
- [x] Phase 20: Add parse validation
- [x] Phase 21: Write parseCsv unit tests

### API Route Foundation (22–24)

- [x] Phase 22: Create analyze API route
- [x] Phase 23: Integrate CSV parsing into API
- [x] Phase 24: Add API error handling

### Dividend Data Fetching (25–29)

- [x] Phase 25: Create fetchDividends function
- [x] Phase 26: Add stock price fetching
- [x] Phase 27: Add batch ticker fetching
- [x] Phase 28: Write fetchDividends unit tests
- [x] Phase 29: Integrate dividend fetching into API

### Projection Engine (30–36)

- [x] Phase 30: Define projection types
- [x] Phase 31: Implement basic projection (no DRIP)
- [x] Phase 32: Extend projection to 3 years
- [x] Phase 33: Implement DRIP calculation
- [x] Phase 34: Aggregate by month
- [x] Phase 35: Write projection unit tests
- [x] Phase 36: Integrate projection into API

### Results UI (37–46)

- [x] Phase 37: Add shadcn Tabs and Collapsible components
- [x] Phase 38: Create results page
- [x] Phase 39: Create portfolio Jotai atom
- [x] Phase 40: Create YearTabs component
- [x] Phase 41: Create MonthCard component (static)
- [x] Phase 42: Create StockPaymentRow component
- [x] Phase 43: Add expand/collapse to MonthCard
- [x] Phase 44: Wire up results page with real data
- [x] Phase 45: Create ErrorBanner component
- [x] Phase 46: Display year totals

### Integration & Navigation (47–50)

- [x] Phase 47: Connect upload to API
- [x] Phase 48: Navigate to results on success
- [x] Phase 49: Add "Upload new file" button
- [x] Phase 50: Handle API errors in UI

### Polish (51–55)

- [x] Phase 51: Add loading states
- [x] Phase 52: Add empty state for months
- [x] Phase 53: Create sample CSV file
- [x] Phase 54: Responsive styling pass
- [x] Phase 55: Final styling polish

### Testing (56–59)

- [x] Phase 56: Write API route integration test
- [x] Phase 57: Write E2E test: successful upload flow
- [x] Phase 58: Write E2E test: error handling
- [ ] Phase 59: Write E2E test: results interaction
