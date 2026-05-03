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
 * import { sliceAfter } from "@telperion/js-utils/array";
 *
 * const fruits = ["apple", "grapes", "banana", "melon", "orange"];
 *
 * sliceAfter(fruits, "banana"); // ["melon", "orange"]
 * sliceAfter(fruits, "kiwi"); // []
 * ```
 *
 * Prototype Example:
 * ```typescript
 * import "@telperion/js-utils/array/proto/slice-after";
 *
 * const fruits = ["apple", "grapes", "banana", "melon", "orange"];
 *
 * fruits.sliceAfter("banana"); // ["melon", "orange"]
 * ```
 * * * *
 * @param array Array to slice
 * @param item Item to slice after
 * @return New array containing the items after the given item
 */
export function sliceAfter<T = unknown>(array: T[], item: T): T[] {
  const index: number = array.indexOf(item);

  if (index < 0) {
    return [];
  }

  return array.slice(index + 1);
}
