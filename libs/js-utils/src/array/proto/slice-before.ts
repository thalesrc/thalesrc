import type { Tail } from '@telperion/extra-ts-types';

import { sliceBefore } from '@telperion/js-utils/array/slice-before';

type FuncType<T> = typeof sliceBefore<T>;
type FuncArgs<T> = Parameters<FuncType<T>>;
type FuncReturn<T> = ReturnType<FuncType<T>>;
type ProtoArgs<T> = Tail<FuncArgs<T>>;

declare global {
  export interface Array<T> {
    /**
     * #### Slice Before
     *
     * Returns a new array containing the items located before the first occurrence
     * of the given item.
     *
     * If the item is not found, an empty array is returned.
     *
     * * * *
     * Example:
     * ```typescript
     * import "@telperion/js-utils/array/proto/slice-before";
     *
     * const fruits = ["apple", "grapes", "banana", "melon", "orange"];
     *
     * fruits.sliceBefore("melon"); // ["apple", "grapes", "banana"]
     * ```
     * * * *
     * @param item Item to slice before
     * @return New array containing the items before the given item
     */
    sliceBefore(...args: ProtoArgs<T>): FuncReturn<T>;
  }
}

Array.prototype.sliceBefore = function<T>(this: T[], ...args: ProtoArgs<T>): FuncReturn<T> {
  return sliceBefore(this, ...args);
};
