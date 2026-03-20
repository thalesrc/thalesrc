import { seconds } from './seconds';

describe('Seconds Function', () => {
  it('should convert seconds to milliseconds', () => {
    expect(seconds(1)).toBe(1000);
  });

  it('should convert multiple seconds', () => {
    expect(seconds(5)).toBe(5000);
  });

  it('should handle zero', () => {
    expect(seconds(0)).toBe(0);
  });

  it('should handle fractional values', () => {
    expect(seconds(0.5)).toBe(500);
  });
});
