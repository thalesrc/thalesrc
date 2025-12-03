/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type helpers for Mixin
 */
type Constructor<T extends object = object, U extends any[] = any[]> = new (...args: U) => T;
type ConstructorParams<T> = T extends new (...args: infer U) => any ? U : never;
type InstanceType<T> = T extends new (...args: any[]) => infer U ? U : never;
type MergeInstances<T, U> = { [P in keyof T]: P extends keyof U ? U[P] : T[P] } & U;

const PROPS_TO_FILTER = ['constructor'];

/**
 * #### Mixin
 *
 * Creates a class that combines two classes using the mixin pattern.
 * The resulting class extends the first class and includes all properties and methods from the second class.
 *
 * * * *
 * Example:
 * ```typescript
 * import { mixin } from "@thalesrc/js-utils/class";
 *
 * class Timestamped {
 *   timestamp = Date.now();
 *   getAge() {
 *     return Date.now() - this.timestamp;
 *   }
 * }
 *
 * class User {
 *   constructor(public name: string) {}
 *   greet() {
 *     return `Hello, ${this.name}`;
 *   }
 * }
 *
 * class TimestampedUser extends mixin(User, Timestamped) {}
 *
 * const user = new TimestampedUser(['John'], []);
 * console.log(user.greet()); // "Hello, John"
 * console.log(user.getAge()); // Time since creation
 * ```
 *
 * @param Base The base class to extend
 * @param Mixin The mixin class to combine
 * @returns A new class that combines both classes
 */
export function mixin<T extends Constructor<any>, U extends Constructor<any>>(
  Base: T,
  Mixin: U
): Constructor<
  MergeInstances<InstanceType<T>, InstanceType<U>>,
  [ConstructorParams<T>, ConstructorParams<U>]
> {
  // @ts-ignore - TypeScript doesn't fully understand the mixin pattern
  class Mixed extends Base implements InstanceType<U> {
    constructor(baseArgs: ConstructorParams<T>, mixinArgs: ConstructorParams<U>) {
      super(...baseArgs);

      // Create an instance of the mixin class and copy its properties
      const mixinInstance = new Mixin(...mixinArgs);

      for (const key of Reflect.ownKeys(mixinInstance)) {
        (this as any)[key] = (mixinInstance as any)[key];
      }
    }
  }

  // Copy prototype methods from mixin to the mixed class
  const mixinKeys = Reflect.ownKeys(Mixin.prototype).filter(
    (key) => !PROPS_TO_FILTER.includes(key as string)
  );

  for (const prop of mixinKeys) {
    (Mixed.prototype as any)[prop] = (Mixin.prototype as any)[prop];
  }

  return Mixed as any;
}
