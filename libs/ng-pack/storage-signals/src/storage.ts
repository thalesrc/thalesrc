import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveStorage } from '@telperion/reactive-storage';
import { StorageSignal } from "./storage-signal";

/**
 * Creates a StorageSignal from a ReactiveStorage instance.
 *
 * @template T - The type of value stored
 * @param storage - The ReactiveStorage instance (localStorage, sessionStorage, or cookie storage)
 * @param store - The storage namespace/store name
 * @param key - The key within the store
 * @returns A StorageSignal that provides reactive access to the stored value
 *
 * @remarks
 * This is a low-level factory function that bridges Angular signals with ReactiveStorage.
 * Most applications should use the higher-level functions:
 * - {@link localStorageSignal} for localStorage
 * - {@link sessionStorageSignal} for sessionStorage
 * - {@link cookieStorageSignal} for cookies
 *
 * The function:
 * 1. Converts the ReactiveStorage Observable into an Angular signal using `toSignal`
 * 2. Creates a Proxy that intercepts calls to add `set`, `update`, and `delete` methods
 * 3. Ensures all storage operations propagate to both the underlying storage and the signal
 *
 * **Proxy Pattern:**
 * The returned signal is a Proxy that:
 * - Delegates reading to the underlying signal
 * - Provides `set()` to write values
 * - Provides `update()` for functional updates
 * - Provides `delete()` to remove the value
 *
 * @example
 * ```typescript
 * // Typically used internally by specialized signal creators
 * import { ReactiveWebLocalStorage } from '@telperion/reactive-storage';
 *
 * const storage = new ReactiveWebLocalStorage('my-app');
 * const userSignal = storageSignal<User>(storage, 'users', 'current');
 *
 * userSignal.set({ id: 1, name: 'Alice' });
 * console.log(userSignal()); // { id: 1, name: 'Alice' }
 *
 * userSignal.update(user => ({ ...user, name: 'Bob' }));
 * userSignal.delete();
 * ```
 *
 * @internal This is primarily for internal use. Use the specialized signal creators instead.
 */
export function storageSignal<T>(storage: ReactiveStorage, store: string, key: string): StorageSignal<T> {
  const source = toSignal(storage.get<T>(store, key));

  function setter(value: T | null | undefined) {
    storage.set(store, key, value);
  }

  function updater(updaterFn: (value: T | null | undefined) => T | null | undefined) {
    const currentValue = source();
    const newValue = updaterFn(currentValue);

    storage.set(store, key, newValue);
  }

  function deleter() {
    storage.delete(store, key);
  }

  return new Proxy(source as StorageSignal<T>, {
    apply() {
      return source();
    },
    get(target, prop, receiver) {
      switch (prop) {
        case 'set':
          return setter;
        case 'update':
          return updater;
        case 'delete':
          return deleter;
        default:
          return Reflect.get(target, prop, receiver);
      }
    }
  })
}
