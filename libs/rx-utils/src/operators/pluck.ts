import { map, type OperatorFunction } from "rxjs";

/**
 * Emits the value of the specified key from the source object.
 *
 * * * *
 * Example usage:
 * ```typescript
 * import { of } from "rxjs";
 * import { pluck } from "@telperion/rx-utils/operators";
 *
 * of({ name: "Alice", age: 30 }).pipe(
 *   pluck("name")
 * ).subscribe(console.log);
 * ```
 * Output:
 * ```
 * "Alice"
 * ```
 * * * *
 * @param key The key to pluck from the source object
 * @returns An Observable that emits the value of the specified key from the source object
 */
export function pluck<T extends Object, K extends keyof T>(key: K): OperatorFunction<T, T[K]> {
  return source => source.pipe(map(value => value[key]));
}
