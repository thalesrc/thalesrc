/* eslint-disable @typescript-eslint/no-explicit-any */

// Symbols to protect overriding private methods & properties of SmartMap Class
const KEY__WEAKMAP: unique symbol = Symbol('SmartMap.weakMap');

/**
 * ### SmartMap
 *
 * Like WeakMap but can also store values using primitive keys
 *
 * * * *
 * Example usage:
 * ```typescript
 * import { SmartMap } from "@thalesrc/js-utils";
 *
 * const aMap = new SmartMap();
 *
 * aMap.set("foo", "foo");
 * aMap.set(1, "thales rocks");
 *
 * console.log(aMap.size) // 2
 *
 * aMap.set({}, "thales rocks again");
 * console.log(aMap.size) // 2
 *
 * const anObject = {};
 * aMap.set(anObject, "thales rocks again and again");
 * console.log(aMap.size) // 3
 * console.log(aMap.get(anObject)) // "thales rocks again and again"
 * ```
 * * * *
 * @template K Typeof Key
 * @template V Typeof Value
 */
export class SmartMap<K = any, V = any> extends Map<K, V> {
  /**
   * Symbol refference of weakmap property
   */
  protected static readonly KEY__WEAKMAP = KEY__WEAKMAP;

  /**
   * Allowed key types to store them in a weakmap instance
   */
  public static readonly TYPES_TO_STORE_IN_WEAKMAP = Object.freeze(['object', 'function']);

  /**
   * Returns a boolean whether if the key is storable in weakmap or not
   *
   * @param key Key to check if it can be stored in weakmap
   * @returns A boolean whether if the key is storable in weakmap or not
   */
  protected static isStorableInWeakMap<Key>(key: Key): boolean {
    return key !== null && SmartMap.TYPES_TO_STORE_IN_WEAKMAP.some(_key => typeof key === _key);
  }

  /**
   * The WeakMap object to store values with associated non-primitive (object) keys
   */
  protected [KEY__WEAKMAP] = new WeakMap<NonNullable<K>, V>();

  /**
   * Returns a boolean asserting whether a value has been associated to the key in the SmartMap object or not.
   *
   * @param key The key of the element to test for presence in the SmartMap object.
   * @returns A boolean asserting whether a value has been associated to the key in the SmartMap object or not.
   */
  override has(key: K): boolean {
    if (SmartMap.isStorableInWeakMap(key)) {
      return this[KEY__WEAKMAP].has(key!);
    }

    return super.has(key);
  }

  /**
   * Returns the value associated to the key, or undefined if there is none.
   *
   * @param key The key of the element to return from the SmartMap object.
   * @returns The value associated to the key
   */
  override get(key: K): V | undefined {
    if (SmartMap.isStorableInWeakMap(key)) {
      return this[KEY__WEAKMAP].get(key as NonNullable<K>);
    }

    return super.get(key);
  }

  /**
   * Sets the value for the key in the SmartMap object.
   *
   * @param key The key of the element to add to the SmartMap object.
   * @param value The value of the element to add to the SmartMap object.
   * @returns Returns the SmartMap object.
   */
  override set(key: K, value: V): this {
    if (SmartMap.isStorableInWeakMap(key)) {
      this[KEY__WEAKMAP].set(key as NonNullable<K>, value);
    } else {
      super.set(key, value);
    }

    return this;
  }

  /**
   * Removes the associated value from the SmartMap object,
   *
   * @param key The key of the element to remove from the SmartMap object.
   * @returns `true` if an element in the SmartMap object existed and has been removed, or `false` if the element does not exist. `SmartMap.prototype.has(key)` will return false afterwards.
   */
  override delete(key: K): boolean {
    return this[KEY__WEAKMAP].delete(key as NonNullable<K>) || super.delete(key);
  }
}
