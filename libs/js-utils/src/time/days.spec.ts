import { days } from './days';

describe('Days Function', () => {
  it('should convert days to milliseconds', () => {
    expect(days(1)).toBe(86400000);
  });

  it('should convert multiple days', () => {
    expect(days(7)).toBe(604800000);
  });

  it('should handle zero', () => {
    expect(days(0)).toBe(0);
  });

  it('should handle fractional values', () => {
    expect(days(0.5)).toBe(43200000);
  });
});
