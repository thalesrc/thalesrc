import { inject, InjectionToken, Provider } from "@angular/core";
import { ReactiveWebLocalStorage } from '@telperion/reactive-storage';

import { storageSignal } from "./storage";
import { StorageSignal } from "./storage-signal";

/**
 * Injection token for the ReactiveWebLocalStorage singleton.
 * @internal
 */
const LOCAL_STORAGE = new InjectionToken<ReactiveWebLocalStorage>('Telperion Local Storage');

/**
 * Provides a ReactiveWebLocalStorage instance for dependency injection.
 *
 * @param appName - Optional application name for namespacing localStorage keys
 * @returns An Angular provider configuration
 *
 * @remarks
 * This provider creates a singleton ReactiveWebLocalStorage instance that can be injected
 * throughout your application. All `localStorageSignal` calls will use this shared instance,
 * ensuring consistent storage access and change detection.
 *
 * **Namespacing:**
 * The `appName` parameter prefixes all localStorage keys to prevent conflicts:
 * - With appName: `my-app:store:key`
 * - Without appName: `store:key`
 *
 * **Singleton Pattern:**
 * Only one instance is created per application, ensuring:
 * - Consistent storage access across components
 * - Efficient memory usage
 * - Reliable cross-component synchronization
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { ApplicationConfig } from '@angular/core';
 * import { provideLocalStorage } from '@telperion/ng-pack/storage-signals';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideLocalStorage('my-app'),
 *     // ... other providers
 *   ]
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Without namespace (keys are not prefixed)
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideLocalStorage(),
 *   ]
 * };
 * ```
 *
 * @public
 */
export function provideLocalStorage(appName?: string): Provider {
  return {
    provide: LOCAL_STORAGE,
    useValue: new ReactiveWebLocalStorage(appName)
  };
}

/**
 * Creates a reactive signal connected to browser's localStorage.
 *
 * @template T - The type of value stored
 * @param store - The storage namespace/store name
 * @param key - The key within the store
 * @returns A StorageSignal that reactively tracks the localStorage value
 *
 * @remarks
 * This function creates an Angular signal that automatically syncs with localStorage.
 * Any changes to the value (via `set`, `update`, or `delete`) are immediately persisted
 * to localStorage and propagate to all components using the same signal.
 *
 * **Requirements:**
 * Must call {@link provideLocalStorage} in application config before using this function.
 *
 * **Storage Key:**
 * The actual localStorage key is formed as:
 * - With app name: `appName:store:key`
 * - Without app name: `store:key`
 *
 * **Type Safety:**
 * Values are automatically serialized/deserialized as JSON:
 * - Objects and arrays are preserved
 * - Primitives (string, number, boolean) work correctly
 * - Functions and undefined values are not supported
 *
 * **Cross-Component Sync:**
 * All components using the same `store` and `key` share the same signal state.
 * Changes in one component immediately reflect in others.
 *
 * @example
 * ```typescript
 * import { Component } from '@angular/core';
 * import { localStorageSignal } from '@telperion/ng-pack/storage-signals';
 *
 * @Component({
 *   selector: 'app-settings',
 *   template: `
 *     <div>
 *       <p>Theme: {{ theme() }}</p>
 *       <button (click)="theme.set('dark')">Dark</button>
 *       <button (click)="theme.set('light')">Light</button>
 *       <button (click)="theme.delete()">Reset</button>
 *     </div>
 *   `
 * })
 * export class SettingsComponent {
 *   theme = localStorageSignal<string>('settings', 'theme');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Complex types
 * interface UserPreferences {
 *   theme: 'light' | 'dark';
 *   fontSize: number;
 *   notifications: boolean;
 * }
 *
 * const prefs = localStorageSignal<UserPreferences>('user', 'preferences');
 *
 * // Set entire object
 * prefs.set({ theme: 'dark', fontSize: 14, notifications: true });
 *
 * // Update specific property
 * prefs.update(current => ({
 *   ...current,
 *   theme: current?.theme === 'dark' ? 'light' : 'dark'
 * }));
 * ```
 *
 * @throws Error if {@link provideLocalStorage} was not called in application config
 *
 * @public
 */
export function localStorageSignal<T>(store: string, key: string): StorageSignal<T> {
  const storage = inject(LOCAL_STORAGE);

  return storageSignal(storage, store, key);
}
