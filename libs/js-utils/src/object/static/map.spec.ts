import './map';
import { map } from '../map';

describe('Map Static Function', () => {
  it('should act as same', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const fn = (value: number) => value * 2;

    const bar = map(obj, fn);
    const baz = Object.map(obj, fn);

    expect(bar).toEqual(baz);
  });
});
