
import './slice-before';
import { sliceBefore } from '../slice-before';

describe('Array SliceBefore Proto Function', () => {
  it('should work as same', () => {
    const foo = ['apple', 'grapes', 'banana', 'melon', 'orange'];

    expect(foo.sliceBefore('melon')).toEqual(sliceBefore(foo, 'melon'));
    expect(foo.sliceBefore('apple')).toEqual(sliceBefore(foo, 'apple'));
    expect(foo.sliceBefore('kiwi')).toEqual(sliceBefore(foo, 'kiwi'));
  });
});
