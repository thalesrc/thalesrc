import { weeks } from './weeks';

describe('Weeks Function', () => {
  it('should convert weeks to milliseconds', () => {
    expect(weeks(1)).toBe(604800000);
  });

  it('should convert multiple weeks', () => {
    expect(weeks(2)).toBe(1209600000);
  });

  it('should handle zero', () => {
    expect(weeks(0)).toBe(0);
  });

  it('should handle fractional values', () => {
    expect(weeks(0.5)).toBe(302400000);
  });
});
