import { inject, InjectionToken, Provider } from "@angular/core";
import { ReactiveWebSessionStorage } from '@telperion/reactive-storage';

import { storageSignal } from "./storage";
import { StorageSignal } from "./storage-signal";

/**
 * Injection token for the ReactiveWebSessionStorage singleton.
 * @internal
 */
const SESSION_STORAGE = new InjectionToken<ReactiveWebSessionStorage>('Telperion Session Storage');

/**
 * Provides a ReactiveWebSessionStorage instance for dependency injection.
 *
 * @param appName - Optional application name for namespacing sessionStorage keys
 * @returns An Angular provider configuration
 *
 * @remarks
 * This provider creates a singleton ReactiveWebSessionStorage instance that can be injected
 * throughout your application. All `sessionStorageSignal` calls will use this shared instance,
 * ensuring consistent storage access and change detection.
 *
 * **SessionStorage vs LocalStorage:**
 * - **sessionStorage**: Data persists only for the browser tab/window session (cleared on close)
 * - **localStorage**: Data persists indefinitely until explicitly cleared
 *
 * **Use Cases for sessionStorage:**
 * - Multi-step form wizards
 * - Temporary authentication tokens
 * - Per-session user preferences
 * - Shopping cart for current session
 * - Tab-specific state isolation
 *
 * **Namespacing:**
 * The `appName` parameter prefixes all sessionStorage keys to prevent conflicts:
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
 * import { provideSessionStorage } from '@telperion/ng-pack/storage-signals';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideSessionStorage('my-app'),
 *     // ... other providers
 *   ]
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Without namespace
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideSessionStorage(),
 *   ]
 * };
 * ```
 *
 * @public
 */
export function provideSessionStorage(appName?: string): Provider {
  return {
    provide: SESSION_STORAGE,
    useValue: new ReactiveWebSessionStorage(appName)
  };
}

/**
 * Creates a reactive signal connected to browser's sessionStorage.
 *
 * @template T - The type of value stored
 * @param store - The storage namespace/store name
 * @param key - The key within the store
 * @returns A StorageSignal that reactively tracks the sessionStorage value
 *
 * @remarks
 * This function creates an Angular signal that automatically syncs with sessionStorage.
 * Any changes to the value (via `set`, `update`, or `delete`) are immediately persisted
 * to sessionStorage and propagate to all components using the same signal.
 *
 * **Session Lifecycle:**
 * - Data is cleared when the browser tab/window is closed
 * - Each tab has its own independent sessionStorage
 * - Opening a page in a new tab creates fresh sessionStorage (even for same URL)
 * - Refreshing the page preserves sessionStorage data
 *
 * **Requirements:**
 * Must call {@link provideSessionStorage} in application config before using this function.
 *
 * **Storage Key:**
 * The actual sessionStorage key is formed as:
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
 * All components in the same tab using the same `store` and `key` share the same signal state.
 * Changes in one component immediately reflect in others within the same tab.
 * Different tabs do NOT share sessionStorage.
 *
 * @example
 * ```typescript
 * import { Component } from '@angular/core';
 * import { sessionStorageSignal } from '@telperion/ng-pack/storage-signals';
 *
 * @Component({
 *   selector: 'app-wizard',
 *   template: `
 *     <div>
 *       <p>Current Step: {{ currentStep() }}</p>
 *       <button (click)="nextStep()">Next</button>
 *       <button (click)="currentStep.delete()">Reset</button>
 *     </div>
 *   `
 * })
 * export class WizardComponent {
 *   currentStep = sessionStorageSignal<number>('wizard', 'step');
 *
 *   nextStep() {
 *     this.currentStep.update(step => (step ?? 0) + 1);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Form data that shouldn't persist across sessions
 * interface FormData {
 *   email: string;
 *   message: string;
 * }
 *
 * const formData = sessionStorageSignal<FormData>('contact', 'draft');
 *
 * // Auto-save form data (cleared when tab closes)
 * formData.set({ email: 'user@example.com', message: 'Hello!' });
 *
 * // Update specific field
 * formData.update(current => ({
 *   ...current,
 *   message: 'Updated message'
 * }));
 * ```
 *
 * @throws Error if {@link provideSessionStorage} was not called in application config
 *
 * @public
 */
export function sessionStorageSignal<T>(store: string, key: string): StorageSignal<T> {
  const storage = inject(SESSION_STORAGE);

  return storageSignal(storage, store, key);
}
