import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { AnyFunction } from '@telperion/extra-ts-types';
import { tryCatch } from "@telperion/js-utils/promise/try-catch";
import { firstValueFrom, Observable } from 'rxjs';

export type Fetcher = {
  [P in keyof HttpClient]: HttpClient[P] extends (...args: infer A) => Observable<unknown> ? <T>(...args: A) => Promise<[unknown, T]> : never;
}

/**
 * Constructs a Fetcher that proxies HttpClient methods and returns a tuple of [error, response].
 * If the HttpClient method throws an error, it will be caught and returned as the first element of the tuple.
 * If the HttpClient method succeeds, the response will be returned as the second element of the tuple.
 * Example usage:
 * ```
 * @Component({
 *   selector: 'app-example',
 *   template: `<button (click)="fetchData()">Fetch Data</button>`,
 * })
 * export class ExampleComponent {
 *   private fetcher = constructFetcher();
 *
 *   async fetchData() {
 *    const [error, response] = await this.fetcher.get('/api/data');
 *
*     if (error) {
*       console.error('Error fetching data:', error);
*     } else {
*       console.log('Fetched data:', response);
*     }
 *   }
 * }
 * ```
 */
export function constructFetcher() {
  const client = inject(HttpClient);

  return new Proxy({} as Fetcher, {
    get(target, prop) {
      if (prop in client) {
        return (...args: any[]) => {
          const method = (client as any)[prop] as AnyFunction;

          return tryCatch(firstValueFrom(method.apply(client, args)));
        }
      }

      throw new Error(`HttpClient does not have method ${String(prop)}`);
    }
  });
}
