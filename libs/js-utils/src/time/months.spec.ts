import { months } from './months';

describe('Months Function', () => {
  it('should convert months to milliseconds (30 days per month)', () => {
    expect(months(1)).toBe(2592000000);
  });

  it('should convert multiple months', () => {
    expect(months(3)).toBe(7776000000);
  });

  it('should handle zero', () => {
    expect(months(0)).toBe(0);
  });

  it('should handle fractional values', () => {
    expect(months(0.5)).toBe(1296000000);
  });
});
