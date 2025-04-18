import { difference, Substraction } from '@thalesrc/js-utils/array/difference';

declare global {
  export interface Set<T> {
    /**
     * #### Difference
     *
     * Gets the difference of the sets
     *
     * * * *
     * Example:
     * ```typescript
     * import "@thalesrc/js-utils/set/proto/difference";
     *
     * const base = new Set(["a", "b", "c", "d"]);
     *
     * base.difference(["a", "b"]); // Set(["c", "d"])
     * ```
     * * * *
     * @param base Base Set
     * @param substraction Set or Array to remove its values from the base
     * @param allDiff By default all the same items encountered in substraction will be removed, set this argument as true to get real difference
     * @returns Difference of base from substraction
     */
    difference(substraction: Substraction, allDiff?: boolean): Set<T>;
  }
}

Set.prototype.difference = function<T>(this: Set<T>, substraction: Substraction, allDiff = false) {
  return difference(this, substraction, allDiff);
};
