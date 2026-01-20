import { describe, expect, it } from 'vitest';
import { cleanStockName } from './utils';

describe('cleanStockName', () => {
  it('removes Inc suffix', () => {
    expect(cleanStockName('Apple Inc')).toBe('Apple');
    expect(cleanStockName('Apple Inc.')).toBe('Apple');
  });

  it('removes Corporation suffix', () => {
    expect(cleanStockName('Microsoft Corporation')).toBe('Microsoft');
    expect(cleanStockName('NVIDIA Corporation')).toBe('NVIDIA');
  });

  it('removes Company suffix', () => {
    expect(cleanStockName('Coca-Cola Company')).toBe('Coca-Cola');
  });

  it('removes Ltd suffix', () => {
    expect(cleanStockName('Tencent Holdings Ltd')).toBe('Tencent');
    expect(cleanStockName('CSL Ltd')).toBe('CSL');
    expect(cleanStockName('Acme Ltd.')).toBe('Acme');
  });

  it('removes SA suffix', () => {
    expect(cleanStockName('Nestlé SA')).toBe('Nestlé');
    expect(cleanStockName("L'Oréal SA")).toBe("L'Oréal");
    expect(cleanStockName('Company S.A.')).toBe('Company');
  });

  it('removes AG suffix', () => {
    expect(cleanStockName('Siemens AG')).toBe('Siemens');
    expect(cleanStockName('BMW AG')).toBe('BMW');
  });

  it('removes plc suffix', () => {
    expect(cleanStockName('Shell plc')).toBe('Shell');
    expect(cleanStockName('HSBC Holdings plc')).toBe('HSBC');
  });

  it('removes SE suffix', () => {
    expect(cleanStockName('SAP SE')).toBe('SAP');
    expect(cleanStockName('TotalEnergies SE')).toBe('TotalEnergies');
  });

  it('removes Corp suffix', () => {
    expect(cleanStockName('SoftBank Group Corp')).toBe('SoftBank');
  });

  it('removes NV suffix', () => {
    expect(cleanStockName('ASML Holding N.V.')).toBe('ASML');
    expect(cleanStockName('Acme NV')).toBe('Acme');
  });

  it('removes LLC suffix', () => {
    expect(cleanStockName('Company LLC')).toBe('Company');
    expect(cleanStockName('Company L.L.C.')).toBe('Company');
  });

  it('handles comma-separated suffixes', () => {
    expect(cleanStockName('Apple, Inc.')).toBe('Apple');
    expect(cleanStockName('Company, Ltd.')).toBe('Company');
  });

  it('handles compound suffixes like Holdings Ltd', () => {
    expect(cleanStockName('Tencent Holdings Ltd')).toBe('Tencent');
    expect(cleanStockName('BHP Group Ltd')).toBe('BHP');
    expect(cleanStockName('HSBC Holdings plc')).toBe('HSBC');
    expect(cleanStockName('Alibaba Group Holding Ltd')).toBe('Alibaba');
  });

  it('preserves names without suffixes', () => {
    expect(cleanStockName('LVMH')).toBe('LVMH');
    expect(cleanStockName('Volvo B')).toBe('Volvo B');
    expect(cleanStockName('Johnson & Johnson')).toBe('Johnson & Johnson');
  });

  it('handles empty string', () => {
    expect(cleanStockName('')).toBe('');
  });

  it('handles name that is only a suffix', () => {
    // Should return original if cleaning would result in empty
    expect(cleanStockName('Inc')).toBe('Inc');
  });

  it('trims whitespace', () => {
    expect(cleanStockName('  Apple Inc  ')).toBe('Apple');
    expect(cleanStockName('Microsoft Corporation  ')).toBe('Microsoft');
  });

  it('is case-insensitive for suffixes', () => {
    expect(cleanStockName('Apple INC')).toBe('Apple');
    expect(cleanStockName('Company CORPORATION')).toBe('Company');
    expect(cleanStockName('Shell PLC')).toBe('Shell');
  });
});
