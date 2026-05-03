import type { Tail } from '@telperion/extra-ts-types';

import { sliceAfter } from '@telperion/js-utils/array/slice-after';

type FuncType<T> = typeof sliceAfter<T>;
type FuncArgs<T> = Parameters<FuncType<T>>;
type FuncReturn<T> = ReturnType<FuncType<T>>;
type ProtoArgs<T> = Tail<FuncArgs<T>>;

declare global {
  export interface Array<T> {
    /**
     * #### Slice After
     *
     * Returns a new array containing the items located after the first occurrence
     * of the given item.
     *
     * If the item is not found, an empty array is returned.
     *
     * * * *
     * Example:
     * ```typescript
     * import "@telperion/js-utils/array/proto/slice-after";
     *
     * const fruits = ["apple", "grapes", "banana", "melon", "orange"];
     *
     * fruits.sliceAfter("banana"); // ["melon", "orange"]
     * ```
     * * * *
     * @param item Item to slice after
     * @return New array containing the items after the given item
     */
    sliceAfter(...args: ProtoArgs<T>): FuncReturn<T>;
  }
}

Array.prototype.sliceAfter = function<T>(this: T[], ...args: ProtoArgs<T>): FuncReturn<T> {
  return sliceAfter(this, ...args);
};
