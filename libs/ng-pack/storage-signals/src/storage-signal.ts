import type { WritableSignal } from "@angular/core";

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
