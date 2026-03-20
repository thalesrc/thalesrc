/**
 * #### Maps the values of an object using a callback function
 *
 * Similar to `Array.prototype.map`, but for objects. Iterates over own enumerable properties
 * and returns a new object with the same keys and transformed values.
 *
 * * * *
 * Example usage:
 * ```typescript
 * import { map } from "@telperion/js-utils/object";
 *
 * const obj = { a: 1, b: 2, c: 3 };
 *
 * map(obj, value => value * 2); // { a: 2, b: 4, c: 6 }
 * ```
 *
 * Example with key usage:
 * ```typescript
 * import { map } from "@telperion/js-utils/object";
 *
 * const obj = { x: 1, y: 2 };
 *
 * map(obj, (value, key) => `${key}_${value}`); // { x: "x_1", y: "y_2" }
 * ```
 * * * *
 * @param object Object to map
 * @param fn Callback function to transform each value, receives the value, key, and the entire object as arguments
 * @returns A new object with the same keys and transformed values
 */
export function map<T extends Object, R>(
  object: T,
  fn: (value: T[keyof T], key: keyof T, object: T) => R
): { [K in keyof T]: R } {
  const result = {} as { [K in keyof T]: R };

  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      result[key] = fn(object[key], key, object);
    }
  }

  return result;
}
