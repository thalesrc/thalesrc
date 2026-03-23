import { Observable } from "rxjs";

/**
 * Wraps a callback-based function into an RxJS Observable that emits once when the callback is invoked, then completes.
 *
 * @param fn - A function that accepts a callback. The callback will be created internally and passed to `fn`.
 * @returns An Observable that emits the callback arguments as a tuple and completes.
 *
 * @example
 * ```ts
 * // Node-style callback
 * fromCallback<(value: string) => void>(cb => setTimeout(() => cb('hello'), 100))
 *   .subscribe(([value]) => console.log(value)); // 'hello'
 * ```
 */
export function fromCallback<C extends (...args: any[]) => any>(
  fn: (callback: C) => any
): Observable<Parameters<C>>;

/**
 * Wraps a callback-based function into an RxJS Observable, transforming the callback arguments with a mapper function.
 *
 * @param fn - A function that accepts a callback. The callback will be created internally and passed to `fn`.
 * @param mapper - A function that transforms the callback arguments into the desired emission value.
 * @returns An Observable that emits the mapper's return value and completes.
 *
 * @example
 * ```ts
 * // With a mapper to extract a single value
 * fromCallback<(err: Error | null, data: string) => void>(
 *   cb => fs.readFile('file.txt', 'utf8', cb),
 *   (_err, data) => data
 * ).subscribe(content => console.log(content));
 * ```
 */
export function fromCallback<C extends (...args: any[]) => any, M extends (...args: Parameters<C>) => any>(
  fn: (callback: C) => any,
  mapper: M
): Observable<ReturnType<M>>;

export function fromCallback<C extends (...args: any[]) => any, M extends ((...args: Parameters<C>) => any) | undefined = undefined>(
  fn: (callback: C) => any,
  mapper: M = ((...args: Parameters<C>) => args) as M
): Observable<M extends (...args: Parameters<C>) => any ? ReturnType<M> : Parameters<C>> {
  return new Observable((subscriber) => {
    const callback = (...args: Parameters<C>) => {
      subscriber.next(mapper!(...args));
      subscriber.complete();
    };

    fn(callback as C);

    return () => {
      subscriber.complete();
    };
  });
}
