/**
 * #### Groups array items by a specified key into a Map
 *
 * Iterates over the array and groups items that share the same value for the given key.
 * Returns a `Map` where each key is a unique value of the specified property and each value is an array of matching items.
 *
 * * * *
 * Example usage:
 * ```typescript
 * import { gather } from "@telperion/js-utils/array";
 *
 * const users = [
 *   { role: "admin", name: "Alice" },
 *   { role: "user", name: "Bob" },
 *   { role: "admin", name: "Charlie" },
 * ];
 *
 * const grouped = gather(users, "role");
 * // Map {
 * //   "admin" => [{ role: "admin", name: "Alice" }, { role: "admin", name: "Charlie" }],
 * //   "user" => [{ role: "user", name: "Bob" }]
 * // }
 * ```
 *
 * Example as Array Prototype:
 * ```typescript
 * import "@telperion/js-utils/array/proto/gather";
 *
 * const users = [
 *   { role: "admin", name: "Alice" },
 *   { role: "user", name: "Bob" },
 *   { role: "admin", name: "Charlie" },
 * ];
 *
 * const grouped = users.gather("role");
 * // Map {
 * //   "admin" => [{ role: "admin", name: "Alice" }, { role: "admin", name: "Charlie" }],
 * //   "user" => [{ role: "user", name: "Bob" }]
 * // }
 * ```
 * * * *
 * @param array Array of objects to group
 * @param key Key to group items by
 * @typeparam T Type of array items
 * @typeparam P Key type
 * @returns A Map grouping items by the specified key's value
 */
export function gather<T extends Record<any, any>, P extends keyof T>(array: T[], key: P) {
  return array.reduce((acc, item) => {
    const groupKey = item[key];

    if (!acc.has(groupKey)) {
      acc.set(groupKey, []);
    }

    acc.get(groupKey)!.push(item);

    return acc;
  }, new Map<T[P], T[]>());
}
