import { inject, Provider } from '@angular/core';
import { ReactiveCookieStorage, ReactiveCookieStorageOptions } from '@telperion/reactive-storage';

import { StorageKeyType, storageSignal } from "./storage-signal";

/**
 * Internal provider that manages ReactiveCookieStorage instances with different configurations.
 *
 * @remarks
 * This class implements a registry pattern to ensure that cookie storages with identical
 * configurations share the same underlying ReactiveCookieStorage instance. This is critical for:
 * - Preventing duplicate cookie writes
 * - Ensuring consistent change detection across components
 * - Optimizing memory usage
 *
 * **Linker Pattern:**
 * All instances created by this provider share a common linker (Symbol) to enable
 * cross-instance synchronization even when using different option combinations.
 *
 * **Instance Deduplication:**
 * Two `cookieStorageSignal` calls with the same options will reuse the same storage instance,
 * preventing redundant cookie operations.
 *
 * @internal This class is not exported publicly
 */
class CookieStorageProvider {
  /**
   * Valid cookie option keys that can be used to configure cookie storage.
   * Filters out any invalid properties from being passed to cookie operations.
   */
  static #VALID_OPTIONS = ['path', 'domain', 'secure', 'sameSite', 'expires', 'maxAge'] as (keyof ReactiveCookieStorageOptions)[];

  /**
   * Shared linker symbol used to synchronize all cookie storage instances
   * created by this provider, enabling cross-instance change notifications.
   */
  #linker = Symbol('ReactiveCookieStorage Linker');

  /**
   * Registry of ReactiveCookieStorage instances keyed by their configuration options.
   * Ensures instances with identical options are reused.
   */
  #stores = new Map<ReactiveCookieStorageOptions, ReactiveCookieStorage>();

  /**
   * Creates a new CookieStorageProvider with base configuration.
   *
   * @param appName - Optional application name for namespacing cookie keys
   * @param baseOptions - Default cookie options applied to all storage instances
   */
  constructor(
    private appName?: string,
    private baseOptions: ReactiveCookieStorageOptions = {}
  ) {
    const parsedOptions = this.#parseOptions(baseOptions);

    this.#stores.set(parsedOptions, new ReactiveCookieStorage(appName, parsedOptions, this.#linker));
  }

  /**
   * Gets or creates a ReactiveCookieStorage instance with the specified options.
   *
   * @param options - Cookie options to override base options
   * @returns A ReactiveCookieStorage instance (reused if options match existing instance)
   *
   * @remarks
   * This method implements option merging and instance deduplication:
   * 1. Merges provided options with base options (provided options take precedence)
   * 2. Checks if an instance with these exact options already exists
   * 3. Returns existing instance if found, otherwise creates and caches a new one
   *
   * All instances share the same linker for cross-instance synchronization.
   */
  getStore(options: ReactiveCookieStorageOptions = {}): ReactiveCookieStorage {
    const parsedOptions = this.#parseOptions({...this.baseOptions, ...options});
    let existingKey = this.#getStoredOptions(parsedOptions);

    if (!existingKey) {
      this.#stores.set(parsedOptions, new ReactiveCookieStorage(this.appName, parsedOptions, this.#linker));
      existingKey = parsedOptions;
    }

    return this.#stores.get(existingKey)!;
  }

  /**
   * Filters cookie options to include only valid properties.
   *
   * @param options - Raw options object that may contain invalid properties
   * @returns Filtered options containing only valid cookie configuration properties
   */
  #parseOptions(options: ReactiveCookieStorageOptions) {
    return Object.fromEntries(
      Object.entries(options).filter(([key]) => CookieStorageProvider.#VALID_OPTIONS.includes(key as keyof ReactiveCookieStorageOptions))
    ) as ReactiveCookieStorageOptions;
  }

  /**
   * Searches the registry for an existing options object that matches the provided options.
   *
   * @param options - Cookie options to search for
   * @returns The stored options object if found, undefined otherwise
   *
   * @remarks
   * Two options objects are considered equal if all valid cookie properties have identical values.
   */
  #getStoredOptions(options: ReactiveCookieStorageOptions): ReactiveCookieStorageOptions | undefined {
    const stored = this.#stores.keys();

    return stored.find(storedOpts => {
      return CookieStorageProvider.#VALID_OPTIONS.every(key => storedOpts[key] === options[key]);
    });
  }
}

/**
 * Provides a CookieStorageProvider instance for dependency injection.
 *
 * @param appName - Optional application name for namespacing cookie keys
 * @param options - Default cookie options applied to all cookie storage signals
 * @returns An Angular provider configuration
 *
 * @remarks
 * This provider creates a singleton CookieStorageProvider that manages all cookie storage
 * instances in your application. All `cookieStorageSignal` calls will use this shared provider.
 *
 * **Cookie Namespacing:**
 * The `appName` parameter prefixes all cookie names to prevent conflicts:
 * - With appName: `my-app:store:key`
 * - Without appName: `store:key`
 *
 * **Base Options:**
 * The `options` parameter provides default cookie configuration for all signals.
 * Individual signals can override these options when created.
 *
 * **Common Options:**
 * - `path` - Cookie path (default: current path)
 * - `domain` - Cookie domain (default: current domain)
 * - `secure` - Require HTTPS (recommended for production)
 * - `sameSite` - CSRF protection ('strict' | 'lax' | 'none')
 * - `maxAge` - Expiry time in seconds
 * - `expires` - Expiry as Date object
 *
 * **Instance Management:**
 * The provider automatically deduplicates storage instances:
 * - Signals with identical options share the same storage instance
 * - All instances are linked for cross-instance synchronization
 * - Memory-efficient for applications with many cookie signals
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { ApplicationConfig } from '@angular/core';
 * import { provideCookieStorage } from '@telperion/ng-pack/storage-signals';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCookieStorage('my-app', {
 *       path: '/',
 *       secure: true,
 *       sameSite: 'strict',
 *       maxAge: 86400 // 24 hours
 *     }),
 *   ]
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Minimal configuration
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCookieStorage('my-app'),
 *   ]
 * };
 * ```
 *
 * @public
 */
export function provideCookieStorage(
  appName?: string,
  options?: ReactiveCookieStorageOptions
): Provider {
  return {
    provide: CookieStorageProvider,
    useValue: new CookieStorageProvider(appName, options)
  };
}

/**
 * Creates a reactive signal connected to browser cookies.
 *
 * @template T - The type of value stored
 * @param store - The cookie namespace/store name
 * @param key - The cookie key within the store
 * @param options - Optional cookie-specific options that override provider defaults
 * @returns A StorageSignal that reactively tracks the cookie value
 *
 * @remarks
 * This function creates an Angular signal that automatically syncs with browser cookies.
 * Any changes to the value (via `set`, `update`, or `delete`) are immediately written
 * to cookies and propagate to all components using the same signal.
 *
 * **Requirements:**
 * Must call {@link provideCookieStorage} in application config before using this function.
 *
 * **Cookie Name:**
 * The actual cookie name is formed as:
 * - With app name: `appName:store:key`
 * - Without app name: `store:key`
 *
 * **Size Limitations:**
 * Cookies have a ~4KB size limit. The underlying ReactiveCookieStorage enforces a 4000 byte
 * limit and throws an error if exceeded. Use localStorage for larger data.
 *
 * **Options Merging:**
 * Cookie options are merged in this order (later overrides earlier):
 * 1. Provider base options (from `provideCookieStorage`)
 * 2. Signal-specific options (from this function's `options` parameter)
 *
 * **Instance Deduplication:**
 * Signals with identical merged options share the same underlying storage instance:
 * ```typescript
 * // These share the same storage instance
 * const token1 = cookieStorageSignal('auth', 'token', { secure: true });
 * const token2 = cookieStorageSignal('auth', 'token', { secure: true });
 *
 * // These use different instances (different options)
 * const temp = cookieStorageSignal('auth', 'token', { maxAge: 300 });
 * ```
 *
 * **Type Safety:**
 * Values are automatically serialized/deserialized as JSON:
 * - Objects and arrays are preserved
 * - Primitives (string, number, boolean) work correctly
 * - Functions and undefined values are not supported
 *
 * **Security Best Practices:**
 * - Use `secure: true` in production (HTTPS only)
 * - Use `sameSite: 'strict'` for CSRF protection
 * - Set appropriate `maxAge` or `expires` for sensitive data
 * - Never store sensitive data in cookies without encryption
 *
 * @example
 * ```typescript
 * import { Component } from '@angular/core';
 * import { cookieStorageSignal } from '@telperion/ng-pack/storage-signals';
 *
 * @Component({
 *   selector: 'app-auth',
 *   template: `
 *     <div>
 *       <p>Token: {{ authToken() }}</p>
 *       <button (click)="login()">Login</button>
 *       <button (click)="logout()">Logout</button>
 *     </div>
 *   `
 * })
 * export class AuthComponent {
 *   // Secure cookie with 1 hour expiry
 *   authToken = cookieStorageSignal<string>('auth', 'token', {
 *     secure: true,
 *     sameSite: 'strict',
 *     maxAge: 3600
 *   });
 *
 *   login() {
 *     this.authToken.set('abc123');
 *   }
 *
 *   logout() {
 *     this.authToken.delete();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // User preferences with different cookie lifetimes
 * const theme = cookieStorageSignal<string>('prefs', 'theme', {
 *   maxAge: 31536000 // 1 year
 * });
 *
 * const tempSetting = cookieStorageSignal<boolean>('prefs', 'banner-dismissed', {
 *   maxAge: 86400 // 1 day
 * });
 *
 * theme.set('dark');
 * tempSetting.set(true);
 * ```
 *
 * @throws Error if {@link provideCookieStorage} was not called in application config
 * @throws Error if the serialized value exceeds 4000 bytes
 *
 * @public
 */
export function cookieStorageSignal<T>(store: string, key: StorageKeyType, options?: ReactiveCookieStorageOptions) {
  const provider = inject(CookieStorageProvider);
  const storage = provider.getStore(options);

  return storageSignal<T>(storage, store, key);
}
