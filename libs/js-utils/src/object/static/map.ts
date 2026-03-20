import { map } from '@telperion/js-utils/object/map';

declare global {
  export interface ObjectConstructor {
    /**
     * #### Maps the values of an object using a callback function
     *
     * Similar to `Array.prototype.map`, but for objects. Iterates over own enumerable properties
     * and returns a new object with the same keys and transformed values.
     *
     * * * *
     * Example usage:
     * ```typescript
     * import "@telperion/js-utils/object/static/map";
     *
     * const obj = { a: 1, b: 2, c: 3 };
     *
     * Object.map(obj, value => value * 2); // { a: 2, b: 4, c: 6 }
     * ```
     * * * *
     * @param object Object to map
     * @param fn Callback function to transform each value, receives the value, key, and the entire object as arguments
     * @returns A new object with the same keys and transformed values
     */
    map: typeof map;
  }
}

Object.map = map;
