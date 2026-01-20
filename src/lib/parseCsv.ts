import Papa from 'papaparse';
import type { AvanzaRow, ParsedPortfolio, PortfolioStock } from './types';

/**
 * Parse Swedish decimal format (comma separator) to JS number
 * Example: "12,5" -> 12.5
 */
function parseSwedishDecimal(value: string): number {
  return parseFloat(value.replace(',', '.'));
}

/**
 * Parse CSV file exported from Avanza
 * - Uses semicolon delimiter
 * - Handles Swedish decimal format (comma separator)
 * - Extracts portfolio stock data
 */
export function parseCsv(csvContent: string): ParsedPortfolio {
  const result = Papa.parse<AvanzaRow>(csvContent, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  });

  const stocks: PortfolioStock[] = [];
  const errors: string[] = [];

  // Check for parsing errors
  if (result.errors.length > 0) {
    errors.push(
      `CSV parsing errors: ${result.errors.map((e) => e.message).join(', ')}`
    );
  }

  // Validate required columns are present
  const requiredColumns = ['Kortnamn', 'Volym'];
  const headers = result.meta.fields || [];

  for (const column of requiredColumns) {
    if (!headers.includes(column)) {
      errors.push(`Missing required column: ${column}`);
    }
  }

  // If required columns are missing, return early
  if (errors.some((error) => error.startsWith('Missing required column'))) {
    return {
      stocks: [],
      errors,
    };
  }

  // Process each row
  for (const row of result.data) {
    try {
      // Extract raw values
      const ticker = row.Kortnamn?.trim();
      const volym = row.Volym?.trim();
      const currency = row.Valuta?.trim();
      const isin = row.ISIN?.trim();
      const type = row.Typ?.trim();
      const name = row.Namn?.trim();

      // Validate required fields exist
      if (!ticker) {
        errors.push(`Row missing ticker (Kortnamn)`);
        continue;
      }

      if (!volym) {
        errors.push(`Row with ticker ${ticker} missing shares (Volym)`);
        continue;
      }

      // Filter: only include STOCK and EXCHANGE_TRADED_FUND
      // Skip FUND and other types as they don't pay traditional dividends
      if (
        type !== 'STOCK' &&
        type !== 'EXCHANGE_TRADED_FUND' &&
        type !== 'ETF'
      ) {
        continue;
      }

      // Parse shares with Swedish decimal format
      const shares = parseSwedishDecimal(volym);

      if (isNaN(shares) || shares <= 0) {
        errors.push(`Invalid share count for ${ticker}: ${volym}`);
        continue;
      }

      // Add stock to portfolio
      stocks.push({
        ticker,
        name: name || ticker,
        shares,
        currency: currency || 'SEK',
        isin: isin || '',
        type: type || 'UNKNOWN',
      });
    } catch (error) {
      errors.push(
        `Error processing row: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Validate that at least some valid stock data was found
  if (stocks.length === 0 && errors.length === 0) {
    errors.push('No valid stock data found in file');
  }

  return {
    stocks,
    errors,
  };
}
