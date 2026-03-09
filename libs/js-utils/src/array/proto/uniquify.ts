import { uniquify } from '@telperion/js-utils/array/uniquify';

declare global {
  export interface Array<T> {
    /**
     * #### Uniquify
     *
     * Removes repeated items from the array
     *
     * * * *
     * Example:
     * ```typescript
     * import "@telperion/js-utils/array/proto/uniquify";
     *
     * const array = ["a", "b", "c", "a", "b", "c"];
     *
     * array.uniquify(); // ["a", "b", "c"]
     * ```
     * * * *
     * @return The new uniquified array
     */
    uniquify(): T[];
  }
}

Array.prototype.uniquify = <any>function<T>(this: T[]): T[] {
  return uniquify(this);
};
