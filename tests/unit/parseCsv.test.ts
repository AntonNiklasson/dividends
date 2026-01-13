import { describe, it, expect } from 'vitest';
import { parseCsv } from '@/lib/parseCsv';

describe('parseCsv', () => {
  describe('Valid Avanza CSV parsing', () => {
    it('should parse a valid Avanza CSV with STOCK entries', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;SKF B;SKF B;14;3506,67;247,76;247,76;SEK;SE;SE0000108227;XSTO;STOCK
1234567;Apple;AAPL;1;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(2);
      expect(result.errors).toHaveLength(0);

      expect(result.stocks[0]).toEqual({
        ticker: 'SKF B',
        name: 'SKF B',
        shares: 14,
        currency: 'SEK',
        isin: 'SE0000108227',
        type: 'STOCK',
      });

      expect(result.stocks[1]).toEqual({
        ticker: 'AAPL',
        name: 'Apple',
        shares: 1,
        currency: 'USD',
        isin: 'US0378331005',
        type: 'STOCK',
      });
    });

    it('should parse EXCHANGE_TRADED_FUND entries', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Vanguard S&P 500;VOO;5;10000,00;2000,00;2000,00;USD;US;US9229083632;XNYS;EXCHANGE_TRADED_FUND`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].type).toBe('EXCHANGE_TRADED_FUND');
    });

    it('should parse ETF entries', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Some ETF;SOME;10;5000,00;500,00;500,00;USD;US;US1234567890;XNYS;ETF`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].type).toBe('ETF');
    });
  });

  describe('Swedish decimal parsing', () => {
    it('should convert Swedish decimal format (comma) to JS number', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Test Stock;TST;12,5;1000,00;80,00;80,00;SEK;SE;SE0000000000;XSTO;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].shares).toBe(12.5);
    });

    it('should handle integer share counts without decimals', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Test Stock;TST;50;1000,00;20,00;20,00;SEK;SE;SE0000000000;XSTO;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].shares).toBe(50);
    });

    it('should handle multiple decimal places', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Test Stock;TST;123,456;1000,00;8,10;8,10;SEK;SE;SE0000000000;XSTO;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].shares).toBe(123.456);
    });
  });

  describe('Filtering by Typ', () => {
    it('should exclude FUND type entries', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;1;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK
1234567;Avanza Global;Avanza Global;72,0;16491,36;193,02;193,02;SEK;SE;SE0011527613;FUND;FUND`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].ticker).toBe('AAPL');
      expect(
        result.stocks.find((s) => s.ticker === 'Avanza Global')
      ).toBeUndefined();
    });

    it('should include only STOCK, EXCHANGE_TRADED_FUND, and ETF types', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Stock A;STKA;10;1000,00;100,00;100,00;SEK;SE;SE0000000001;XSTO;STOCK
1234567;ETF A;ETFA;5;500,00;100,00;100,00;USD;US;US0000000001;XNAS;EXCHANGE_TRADED_FUND
1234567;ETF B;ETFB;8;800,00;100,00;100,00;EUR;DE;DE0000000001;XETRA;ETF
1234567;Fund A;FNDA;20;2000,00;100,00;100,00;SEK;SE;SE0000000002;FUND;FUND
1234567;Bond A;BNDA;15;1500,00;100,00;100,00;SEK;SE;SE0000000003;XSTO;BOND`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(3);
      expect(result.stocks.map((s) => s.ticker)).toEqual([
        'STKA',
        'ETFA',
        'ETFB',
      ]);
    });
  });

  describe('Missing columns validation', () => {
    it('should return error when Kortnamn column is missing', () => {
      const csv = `Kontonummer;Namn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;1;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Missing required column: Kortnamn');
    });

    it('should return error when Volym column is missing', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Missing required column: Volym');
    });

    it('should return errors for both missing columns', () => {
      const csv = `Kontonummer;Namn;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Missing required column: Kortnamn');
      expect(result.errors).toContain('Missing required column: Volym');
    });
  });

  describe('Invalid data handling', () => {
    it('should error on row with missing ticker', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;;10;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Row missing ticker (Kortnamn)');
    });

    it('should error on row with missing shares', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain(
        'Row with ticker AAPL missing shares (Volym)'
      );
    });

    it('should error on invalid share count (not a number)', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;abc;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Invalid share count for AAPL: abc');
    });

    it('should error on negative share count', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;-5;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Invalid share count for AAPL: -5');
    });

    it('should error on zero share count', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;0;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('Invalid share count for AAPL: 0');
    });

    it('should skip invalid rows but continue processing valid ones', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Apple;AAPL;10;2388,20;267,63;267,63;USD;US;US0378331005;XNAS;STOCK
1234567;Invalid;;5;1000,00;200,00;200,00;USD;US;US0000000000;XNAS;STOCK
1234567;Microsoft;MSFT;20;6000,00;300,00;300,00;USD;US;US5949181045;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(2);
      expect(result.stocks.map((s) => s.ticker)).toEqual(['AAPL', 'MSFT']);
      expect(result.errors).toContain('Row missing ticker (Kortnamn)');
    });
  });

  describe('Empty file handling', () => {
    it('should return error for file with no valid stock data', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Avanza Global;Avanza Global;72,0;16491,36;193,02;193,02;SEK;SE;SE0011527613;FUND;FUND`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('No valid stock data found in file');
    });

    it('should return error for empty CSV (headers only)', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(0);
      expect(result.errors).toContain('No valid stock data found in file');
    });
  });

  describe('Field defaults and optional values', () => {
    it('should default currency to SEK if missing', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Test Stock;TST;10;1000,00;100,00;100,00;;SE;SE0000000000;XSTO;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].currency).toBe('SEK');
    });

    it('should default ISIN to empty string if missing', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Test Stock;TST;10;1000,00;100,00;100,00;SEK;SE;;XSTO;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].isin).toBe('');
    });

    it('should use ticker as name if Namn is missing', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;;TST;10;1000,00;100,00;100,00;SEK;SE;SE0000000000;XSTO;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].name).toBe('TST');
    });

    it('should default type to UNKNOWN if missing', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;Test Stock;TST;10;1000,00;100,00;100,00;SEK;SE;SE0000000000;XSTO;`;

      const result = parseCsv(csv);

      // Should be filtered out since it's not STOCK, EXCHANGE_TRADED_FUND, or ETF
      expect(result.stocks).toHaveLength(0);
    });
  });

  describe('Whitespace handling', () => {
    it('should trim whitespace from ticker and other fields', () => {
      const csv = `Kontonummer;Namn;Kortnamn;Volym;Marknadsvärde;GAV (SEK);GAV;Valuta;Land;ISIN;Marknad;Typ
1234567;  Apple  ;  AAPL  ;10;2388,20;267,63;267,63;  USD  ;US;  US0378331005  ;XNAS;STOCK`;

      const result = parseCsv(csv);

      expect(result.stocks).toHaveLength(1);
      expect(result.stocks[0].ticker).toBe('AAPL');
      expect(result.stocks[0].name).toBe('Apple');
      expect(result.stocks[0].currency).toBe('USD');
      expect(result.stocks[0].isin).toBe('US0378331005');
    });
  });
});
