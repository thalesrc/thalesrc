import { hours } from './hours';

describe('Hours Function', () => {
  it('should convert hours to milliseconds', () => {
    expect(hours(1)).toBe(3600000);
  });

  it('should convert multiple hours', () => {
    expect(hours(2)).toBe(7200000);
  });

  it('should handle zero', () => {
    expect(hours(0)).toBe(0);
  });

  it('should handle fractional values', () => {
    expect(hours(0.5)).toBe(1800000);
  });
});
