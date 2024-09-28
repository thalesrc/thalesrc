import { DeepestObject } from "@thalesrc/extra-ts-types";

/**
 * #### Get deepest object in an object chain
 *
 *  * * * *
 * Example usage:
 * ```typescript
 * import { deepest } from "@thalesrc/js-utils/object";
 *
 * const a = {
 *  x: null
 * };
 *
 * const b = {
 *  x: a
 * };
 *
 * const c = {
 *  x: b
 * };
 *
 * deepest(c, 'x'); // {x: null} (a)
 *
 * ```
 * Static usage example:
 * ```typescript
 * import "@thalesrc/js-utils/object/static/deepest";
 *
 * const a = {
 *  x: null
 * };
 *
 * const b = {
 *  x: a
 * };
 *
 * const c = {
 *  x: b
 * };
 *
 * Object.deepest(c, 'x'); // a
 * ```
 * * * *
 * @param object Object to deep dive
 * @param key key of the object which contains same type instance
 */
export function deepest<T, K extends keyof T>(object: T, key: K): DeepestObject<T, K> {
  let obj = object;

  while (obj[key]) {
    obj = obj[key] as T;
  }

  return obj as DeepestObject<T, K>;
}
