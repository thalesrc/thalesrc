import { difference } from "@thalesrc/js-utils";

type Merge<T, U> = {[P in keyof T]: P extends keyof U ? U[P] : T[P]} & U;
type Constructor<T extends {}, U extends any[] = any[]> = new (...args: U) => T;

type ConstructorProps<T> = T extends {new (...args: infer U): any;} ? U : never;
type Instance<T> = T extends {new (...args: any[]): infer U;} ? U : never;

const PROPS_TO_FILTER = ['constructor'];

export function Mixin<T extends Constructor<any>, U extends Constructor<any>>(
  First: T,
  Second: U
): Constructor<Merge<Instance<T>, Instance<U>>, [ConstructorProps<T>, ConstructorProps<U>]> {
  // @ts-ignore
  class Mixed extends First implements U {

    constructor(firstArgs: ConstructorProps<T>, secondArgs: ConstructorProps<U>) {
      super(...firstArgs);

      const secondInstance = new Second(...secondArgs);

      for (const key of Reflect.ownKeys(secondInstance)) {
        this[key as string] = secondInstance[key];
      }
    }
  }

  for (const prop of difference(Reflect.ownKeys(Second.prototype), PROPS_TO_FILTER)) {
    Mixed.prototype[prop] = Second.prototype[prop];
  }

  return Mixed;
}
