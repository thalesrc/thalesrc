
import './difference';
import { difference } from '../../array/difference';

describe('Set Difference Proto Function', () => {
  it('should work as same', () => {
    const foo = new Set([1, 2, 3, 4, 5]);
    const bar = [1, 2];
    const baz = new Set([2, 3]);

    expect(foo.getDifference(bar)).toEqual(difference(foo, bar));
    expect(foo.getDifference(baz)).toEqual(difference(foo, baz));

    expect(foo.getDifference(bar, true)).toEqual(difference(foo, bar, true));
    expect(foo.getDifference(baz, true)).toEqual(difference(foo, baz, true));
  });
});
