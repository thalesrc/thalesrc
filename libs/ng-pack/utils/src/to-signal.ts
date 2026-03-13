import { Signal } from "@angular/core";
import { toSignal as ngToSignal } from "@angular/core/rxjs-interop";
import { from, Observable } from "rxjs";
import { promisify } from '@telperion/js-utils/promise/promisify';

/**
 * Converts a value, Promise, or Observable into an Angular Signal.
 * Accepts any of the three source types and normalises them through
 * `@angular/core/rxjs-interop`'s `toSignal` under the hood.
 *
 * @param source - A plain value, Promise, or Observable to convert
 * @param options - Optional configuration forwarded to Angular's `toSignal`
 * @returns A read-only Signal that emits the resolved value (or `undefined` until it resolves)
 *
 * @example
 * ```typescript
 * // From a plain value
 * const sig = toSignal(42);
 *
 * // From a Promise
 * const sig = toSignal(fetch('/api/data').then(r => r.json()));
 *
 * // From an Observable
 * const sig = toSignal(myService.data$);
 * ```
 */
export function toSignal<T>(
  source: T | Promise<T> | Observable<T>,
  options: Partial<Parameters<typeof ngToSignal<T, T>>[1]> = {}
): Signal<T | undefined> {
  if (!(source instanceof Observable)) {
    source = promisify(source);
  }

  return ngToSignal(from(source), options as Parameters<typeof ngToSignal<T, T>>[1]);
}
