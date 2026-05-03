
import { sliceBefore } from './slice-before';

describe('SliceBefore Function', () => {
  let foo: string[];

  beforeEach(() => {
    foo = ['apple', 'grapes', 'banana', 'melon', 'orange'];
  });

  it('should return items before the given item', () => {
    expect(sliceBefore(foo, 'melon')).toEqual(['apple', 'grapes', 'banana']);
  });

  it('should return an empty array if the item is the first one', () => {
    expect(sliceBefore(foo, 'apple')).toEqual([]);
  });

  it('should return all items except the last when slicing before the last item', () => {
    expect(sliceBefore(foo, 'orange')).toEqual(['apple', 'grapes', 'banana', 'melon']);
  });

  it('should return an empty array if the item is not found', () => {
    expect(sliceBefore(foo, 'kiwi')).toEqual([]);
  });

  it('should slice before the first occurrence when there are duplicates', () => {
    const arr = [1, 2, 3, 2, 1];
    expect(sliceBefore(arr, 2)).toEqual([1]);
  });

  it('should not mutate the original array', () => {
    sliceBefore(foo, 'melon');
    expect(foo).toEqual(['apple', 'grapes', 'banana', 'melon', 'orange']);
  });
});
