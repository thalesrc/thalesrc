
import './slice-after';
import { sliceAfter } from '../slice-after';

describe('Array SliceAfter Proto Function', () => {
  it('should work as same', () => {
    const foo = ['apple', 'grapes', 'banana', 'melon', 'orange'];

    expect(foo.sliceAfter('banana')).toEqual(sliceAfter(foo, 'banana'));
    expect(foo.sliceAfter('orange')).toEqual(sliceAfter(foo, 'orange'));
    expect(foo.sliceAfter('kiwi')).toEqual(sliceAfter(foo, 'kiwi'));
  });
});
