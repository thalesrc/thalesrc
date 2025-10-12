import { OpenPromise } from "@thalesrc/js-utils/open-promise";
import { type Observable } from "rxjs";

/**
 * Creates an AsyncIterator from an Observable.
 *
 * @param observable The Observable to convert.
 * @returns An AsyncIterator that yields values from the Observable.
 */
export function makeAsyncIterator<T>(observable: Observable<T>): AsyncIterator<T> {
  const cache = [] as T[];
  let i = 0;
  let promise = new OpenPromise<T>();

  const subs = observable.subscribe({
    next(value) {
      cache.push(value);
      promise.resolve(value);
      promise = new OpenPromise<T>();
    },
    error(err) {
      promise.reject(err);
      throw err;
    },
    complete() {
      subs.unsubscribe();
    }
  });

  return {
    async next() {
      if (i < cache.length) {
        return { value: cache[i++], done: false };
      }
      const value = await promise;
      i++;
      return { value, done: false };
    },
    throw(err) {
      subs.unsubscribe();
      return Promise.reject(err);
    },
    return() {
      subs.unsubscribe();
      return Promise.resolve({ value: undefined, done: true });
    }
  }
}

/**
 * Converts an RxJS Observable into an AsyncIterable.
 *
 * Example usage:
 * ```ts
 * import { of } from 'rxjs';
 * import { toAsyncIterator } from '@thalesrc/rx-utils';
 *
 * const observable = of(1, 2, 3);
 * const asyncIterable = toAsyncIterator(observable);
 *
 * for await (const value of asyncIterable) {
 *   console.log(value);
 * }
 * ```
 *
 * @param observable The Observable to convert.
 * @returns An AsyncIterable that yields values from the Observable.
 */
export function toAsyncIteratable<T>(observable: Observable<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      return makeAsyncIterator(observable);
    }
  }
}
