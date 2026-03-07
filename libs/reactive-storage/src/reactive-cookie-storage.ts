import { Subject } from 'rxjs';

import { ReactiveStorage, ReactiveStorageChangeEvent } from './reactive-storage';
import { toAsyncIterator } from './async-iterator.polyfill';
import { jsonParse } from './json-parse';

/**
 * Options for configuring cookie behavior in ReactiveCookieStorage.
 */
export interface ReactiveCookieStorageOptions {
  /** URL path where the cookie is valid. Default: '/' */
  path?: string;
  /** Domain where the cookie is valid. Default: current domain */
  domain?: string;
  /** Cookie lifetime in seconds. Default: undefined (session cookie) */
  maxAge?: number;
  /** Absolute expiration date. Default: undefined */
  expires?: Date;
  /** HTTPS only flag. Default: false */
  secure?: boolean;
  /** CSRF protection level. Default: 'lax' */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Reactive wrapper for browser cookies.
 * Provides RxJS-based reactive API for cookie storage with automatic change detection.
 *
 * **Important Limitations:**
 * - Cookies have a ~4KB size limit per cookie
 * - No native change events - use linker to sync multiple instances
 * - Cannot access httpOnly cookies set by the server
 *
 * **Cross-Instance Synchronization:**
 * Link multiple instances using any shared value (symbol, string, object, etc.) to automatically sync changes between them.
 *
 * @template S - Storage store name type
 *
 * @example
 * ```typescript
 * // Single instance
 * const storage = new ReactiveCookieStorage('my-app', {
 *   path: '/',
 *   maxAge: 86400,
 *   secure: true,
 *   sameSite: 'strict'
 * });
 *
 * // Multiple linked instances using a symbol
 * const linker = Symbol('cookie-sync');
 * const storageOne = new ReactiveCookieStorage('my-app', { secure: true }, linker);
 * const storageTwo = new ReactiveCookieStorage('my-app', { secure: false }, linker);
 * // Changes in storageOne will notify storageTwo and vice versa
 *
 * // Or use any other value type
 * const storageA = new ReactiveCookieStorage('my-app', { secure: true }, 'my-linker');
 * const storageB = new ReactiveCookieStorage('my-app', { secure: false }, 'my-linker');
 * ```
 */
export class ReactiveCookieStorage<S extends string = string> extends ReactiveStorage<S> {
  static readonly #MAX_COOKIE_SIZE = 4000; // Conservative 4KB limit
  static readonly #LINKERS = new Map<any, Set<ReactiveCookieStorage<any>>>();

  /**
   * Safely parse JSON with error handling.
   * Returns undefined if parsing fails.
   */
  static #parse(value: string): any {
    return jsonParse(value);
  }

  readonly #changes$ = new Subject<ReactiveStorageChangeEvent<S>>();
  readonly #linker?: any;

  constructor(
    public readonly appName: string = 'app',
    private readonly options: ReactiveCookieStorageOptions = {},
    linker?: any
  ) {
    super();

    // Register to linker group if provided
    if (linker) {
      this.#linker = linker;
      if (!ReactiveCookieStorage.#LINKERS.has(linker)) {
        ReactiveCookieStorage.#LINKERS.set(linker, new Set());
      }
      ReactiveCookieStorage.#LINKERS.get(linker)!.add(this);
    }
  }

  /**
   * Destroy the storage instance and cleanup resources.
   * Unregisters from linker group and completes the changes subject.
   * Call this when you're done using the storage to prevent memory leaks.
   */
  destroy(): void {
    // Unregister from linker group
    if (this.#linker) {
      const linkedInstances = ReactiveCookieStorage.#LINKERS.get(this.#linker);
      if (linkedInstances) {
        linkedInstances.delete(this);
        if (linkedInstances.size === 0) {
          ReactiveCookieStorage.#LINKERS.delete(this.#linker);
        }
      }
    }

    this.#changes$.complete();
  }

  protected async [ReactiveStorage.Props.GET_ALL](): Promise<any> {
    const cookies = this.#getAppCookies();

    return Object.fromEntries(
      Object.entries(cookies).map(([storeName, value]) => [storeName, ReactiveCookieStorage.#parse(value)])
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected [ReactiveStorage.Props.CHANGES] = (this.#changes$ as any)[Symbol.asyncIterator] ?? toAsyncIterator(this.#changes$);

  protected async [ReactiveStorage.Props.SET](storeName: S, value: unknown): Promise<void> {
    const serialized = JSON.stringify(value);
    const cookieName = this.#getCookieName(storeName);

    // Validate size before setting
    const cookieString = `${cookieName}=${encodeURIComponent(serialized)}`;
    this.#validateSize(cookieString);

    this.#setCookie(cookieName, serialized); // Uses instance options

    const event = { storeName, value };
    this.#changes$.next(event);
    this.#notifyLinkedInstances(event);
  }

  protected async [ReactiveStorage.Props.REMOVE](storeName: S): Promise<void> {
    const cookieName = this.#getCookieName(storeName);

    // Delete cookie by setting max-age to 0
    this.#setCookie(cookieName, '', { maxAge: 0 });

    const event = { storeName, value: undefined };
    this.#changes$.next(event);
    this.#notifyLinkedInstances(event);
  }

  /**
   * Convert store name to cookie name by prefixing with app name.
   * Sanitizes to only allow alphanumeric, underscore, and hyphen.
   */
  #getCookieName(storeName: S): string {
    return `${this.appName}_${storeName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Parse document.cookie string into key-value object.
   * Handles decoding of cookie values.
   */
  #parseCookies(): Record<string, string> {
    if (!document.cookie) {
      return {};
    }

    return Object.fromEntries(
      document.cookie
        .split('; ')
        .filter(Boolean)
        .map((cookie) => {
          const separatorIndex = cookie.indexOf('=');
          if (separatorIndex === -1) {
            return [cookie, ''];
          }
          const name = cookie.slice(0, separatorIndex);
          const value = cookie.slice(separatorIndex + 1);
          try {
            return [name, decodeURIComponent(value)];
          } catch {
            return [name, value]; // Return raw value if decode fails
          }
        })
    );
  }

  /**
   * Get all cookies that belong to this app (matching appName prefix).
   * Returns object with storeName -> encoded value.
   */
  #getAppCookies(): Record<string, string> {
    const allCookies = this.#parseCookies();
    const prefix = `${this.appName}_`;
    const appCookies: Record<string, string> = {};

    for (const [cookieName, value] of Object.entries(allCookies)) {
      if (cookieName.startsWith(prefix)) {
        const storeName = cookieName.slice(prefix.length);
        appCookies[storeName] = value;
      }
    }

    return appCookies;
  }

  /**
   * Build and set a cookie with the instance's configured options.
   * Pass options parameter to override specific settings (e.g., maxAge: 0 to delete).
   */
  #setCookie(name: string, value: string, overrides: Partial<ReactiveCookieStorageOptions> = {}): void {
    const opts = { ...this.options, ...overrides };
    let cookie = `${name}=${encodeURIComponent(value)}`;

    if (opts.path !== undefined) cookie += `; path=${opts.path}`;
    if (opts.domain) cookie += `; domain=${opts.domain}`;
    if (opts.maxAge !== undefined) cookie += `; max-age=${opts.maxAge}`;
    if (opts.expires) cookie += `; expires=${opts.expires.toUTCString()}`;
    if (opts.secure) cookie += '; secure';
    if (opts.sameSite) cookie += `; samesite=${opts.sameSite}`;

    document.cookie = cookie;
  }

  /**
   * Validate that a cookie string doesn't exceed size limits.
   * Throws an error if the cookie is too large.
   */
  #validateSize(cookieString: string): void {
    if (cookieString.length > ReactiveCookieStorage.#MAX_COOKIE_SIZE) {
      throw new Error(
        `Cookie size (${cookieString.length} bytes) exceeds ${ReactiveCookieStorage.#MAX_COOKIE_SIZE} byte limit. ` +
          `Consider using localStorage for larger data or splitting across multiple stores.`
      );
    }
  }

  /**
   * Notify all other linked storage instances about a change.
   * This instance will not be notified (to prevent infinite loops).
   */
  #notifyLinkedInstances(event: ReactiveStorageChangeEvent<S>): void {
    if (!this.#linker) return;

    const linkedInstances = ReactiveCookieStorage.#LINKERS.get(this.#linker);
    if (!linkedInstances) return;

    for (const instance of linkedInstances) {
      if (instance !== this) {
        instance.#changes$.next(event);
      }
    }
  }
}
