import type { Tail } from '@thalesrc/ts-utils/tail.type';

import { remove } from '../remove';

type FuncType<T> = typeof remove<T>;
type FuncArgs<T> = Parameters<FuncType<T>>;
type FuncReturn<T> = ReturnType<FuncType<T>>;
type ProtoArgs<T> = Tail<FuncArgs<T>>;

declare global {
  export interface Array<T> {
    /**
     * #### Remove
     *
     * Removes an item from the array
     *
     * Removes all item references if multi is set to `true`
     *
     * * * *
     * Example:
     * ```typescript
     * import "@thalesrc/js-utils/array/proto/remove";
     *
     * const array = ["a", "b", "c", "a", "b", "c"];
     *
     * array.remove("b", true); // ["a", "c", "a", "c"]
     * ```
     * * * *
     * @param itemToRemove Item to remove
     * @return New array
     */
    remove(...args: ProtoArgs<T>): FuncReturn<T>;
  }
}

Array.prototype.remove = function<T>(this: T[], ...args: ProtoArgs<T>): FuncReturn<T> {
  return remove(this, ...args);
};
