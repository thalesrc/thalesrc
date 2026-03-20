import { minutes } from './minutes';

describe('Minutes Function', () => {
  it('should convert minutes to milliseconds', () => {
    expect(minutes(1)).toBe(60000);
  });

  it('should convert multiple minutes', () => {
    expect(minutes(2)).toBe(120000);
  });

  it('should handle zero', () => {
    expect(minutes(0)).toBe(0);
  });

  it('should handle fractional values', () => {
    expect(minutes(0.5)).toBe(30000);
  });
});
