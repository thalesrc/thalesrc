
import { sliceAfter } from './slice-after';

describe('SliceAfter Function', () => {
  let foo: string[];

  beforeEach(() => {
    foo = ['apple', 'grapes', 'banana', 'melon', 'orange'];
  });

  it('should return items after the given item', () => {
    expect(sliceAfter(foo, 'banana')).toEqual(['melon', 'orange']);
  });

  it('should return an empty array if the item is the last one', () => {
    expect(sliceAfter(foo, 'orange')).toEqual([]);
  });

  it('should return all items except the first when slicing after the first item', () => {
    expect(sliceAfter(foo, 'apple')).toEqual(['grapes', 'banana', 'melon', 'orange']);
  });

  it('should return an empty array if the item is not found', () => {
    expect(sliceAfter(foo, 'kiwi')).toEqual([]);
  });

  it('should slice after the first occurrence when there are duplicates', () => {
    const arr = [1, 2, 3, 2, 1];
    expect(sliceAfter(arr, 2)).toEqual([3, 2, 1]);
  });

  it('should not mutate the original array', () => {
    sliceAfter(foo, 'banana');
    expect(foo).toEqual(['apple', 'grapes', 'banana', 'melon', 'orange']);
  });
});
