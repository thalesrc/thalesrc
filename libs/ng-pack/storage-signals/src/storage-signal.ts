import { ReactiveStorage } from '@telperion/reactive-storage';
import { observableSignalToSignal } from "@telperion/ng-pack/utils";
import { computed, Signal, WritableSignal } from "@angular/core";

/**
 * A specialized writable signal interface for browser storage that extends Angular's WritableSignal
 * with storage-specific operations.
 *
 * @template T - The type of value stored in the storage signal
 *
 * @remarks
 * StorageSignal combines Angular's signal reactivity with browser storage persistence.
 * It supports standard signal operations (get, set, update) plus a delete operation to remove
 * the stored value.
 *
 * The signal value is always `T | null | undefined` because:
 * - `null` indicates the key exists but has no value
 * - `undefined` indicates the key doesn't exist in storage
 *
 * @example
 * ```typescript
 * // Type-safe signal for user preferences
 * const theme: StorageSignal<string> = localStorageSignal('settings', 'theme');
 *
 * // Read value (returns string | null | undefined)
 * const currentTheme = theme();
 *
 * // Set new value
 * theme.set('dark');
 *
 * // Update based on current value
 * theme.update(current => current === 'dark' ? 'light' : 'dark');
 *
 * // Delete from storage
 * theme.delete();
 * ```
 *
 * @see {@link WritableSignal}
 * @public
 */
export interface StorageSignal<T> extends WritableSignal<T | null | undefined> {
  /**
   * Deletes the value from storage and updates the signal to undefined.
   *
   * @remarks
   * This method removes the key-value pair from the underlying storage
   * (localStorage, sessionStorage, or cookies) and updates the signal
   * to reflect the deletion by setting its value to `undefined`.
   *
   * All components or effects subscribed to this signal will be notified
   * of the change.
   *
   * @example
   * ```typescript
   * const userToken = localStorageSignal<string>('auth', 'token');
   * userToken.set('abc123');
   *
   * // Later, on logout
   * userToken.delete(); // Removes from storage, signal() returns undefined
   * ```
   */
  delete(): void;
}


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
 * 1. Converts the ReactiveStorage Observable into an Angular signal using `observableToSignal`
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
export function storageSignal<T>(storage: ReactiveStorage, store: string, key: string | Signal<string>): StorageSignal<T> {
  const resolvedKey = typeof key === 'string' ? () => key : key;
  const source$ = computed(() => storage.get<T>(store, resolvedKey()));
  const source = observableSignalToSignal(source$, undefined);

  function setter(value: T | null | undefined) {
    storage.set(store, resolvedKey(), value);
  }

  function updater(updaterFn: (value: T | null | undefined) => T | null | undefined) {
    const currentValue = source();
    const newValue = updaterFn(currentValue);

    storage.set(store, resolvedKey(), newValue);
  }

  function deleter() {
    storage.delete(store, resolvedKey());
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
