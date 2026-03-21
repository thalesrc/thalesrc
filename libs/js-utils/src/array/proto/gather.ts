import { gather } from '@telperion/js-utils/array/gather';

declare global {
  export interface Array<T> {
    /**
     * #### Gather
     *
     * Groups array items by a specified key into a Map
     *
     * * * *
     * Example:
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
     * @param key Key to group items by
     * @return A Map grouping items by the specified key's value
     */
    gather<P extends keyof T>(key: P): Map<T[P], T[]>;
  }
}

Array.prototype.gather = function<T extends Record<any, any>, P extends keyof T>(this: T[], key: P): Map<T[P], T[]> {
  return gather(this, key);
};
