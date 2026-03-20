import { years } from './years';

describe('Years Function', () => {
  it('should convert years to milliseconds (365 days per year)', () => {
    expect(years(1)).toBe(31536000000);
  });

  it('should convert multiple years', () => {
    expect(years(2)).toBe(63072000000);
  });

  it('should handle zero', () => {
    expect(years(0)).toBe(0);
  });

  it('should handle fractional values', () => {
    expect(years(0.5)).toBe(15768000000);
  });
});
