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
 * import { sliceBefore } from "@telperion/js-utils/array";
 *
 * const fruits = ["apple", "grapes", "banana", "melon", "orange"];
 *
 * sliceBefore(fruits, "melon"); // ["apple", "grapes", "banana"]
 * sliceBefore(fruits, "kiwi"); // []
 * ```
 *
 * Prototype Example:
 * ```typescript
 * import "@telperion/js-utils/array/proto/slice-before";
 *
 * const fruits = ["apple", "grapes", "banana", "melon", "orange"];
 *
 * fruits.sliceBefore("melon"); // ["apple", "grapes", "banana"]
 * ```
 * * * *
 * @param array Array to slice
 * @param item Item to slice before
 * @return New array containing the items before the given item
 */
export function sliceBefore<T = unknown>(array: T[], item: T): T[] {
  const index: number = array.indexOf(item);

  if (index < 0) {
    return [];
  }

  return array.slice(0, index);
}
