import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injector, signal, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { map as objectMap } from '@telperion/js-utils/object/map';
import { isFalsy } from '@telperion/js-utils/is-falsy';
import { defer } from '@telperion/js-utils/function/defer';
import { toObservable } from "@telperion/ng-pack/utils";
import { shareLast } from "@telperion/rx-utils/operators/share-last";
import { combineLatest, Observable, of, map, debounceTime, switchMap, catchError, tap, mergeWith, Subject, mapTo, startWith, filter, firstValueFrom } from "rxjs";

interface FetcherSignalOptionTypes<
  Result,
  Body,
  Params extends Record<string, string>,
  QueryParams extends Record<string, string> | HttpParams
> {
  url?: string;
  method?: Parameters<HttpClient['request']>[0];
  headers?: Record<string, string>;
  body?: Body;
  queryParams?: QueryParams;
  params?: Params;
  fallback?: Result;
}

type ParsedFetcherSignalOptions<
  Result,
  Body,
  Params extends Record<string, string>,
  QueryParams extends Record<string, string> | HttpParams
> = {
  [K in keyof FetcherSignalOptionTypes<Result, Body, Params, QueryParams>]: Observable<FetcherSignalOptionTypes<Result, Body, Params, QueryParams>[K]>;
}

type OptionDefaults<
  Result,
  Body,
  Params extends Record<string, string>,
  QueryParams extends Record<string, string> | HttpParams
> = {
  [K in keyof FetcherSignalOptionTypes<Result, Body, Params, QueryParams>]-?: FetcherSignalOptionTypes<Result, Body, Params, QueryParams>[K];
}

/**
 * Options accepted by {@link fetcherSignal}.
 *
 * Every field accepts a plain value, a `Signal`, a `Promise`, or an `Observable`
 * of that value. When a reactive option emits a new value, the request is
 * re-executed (debounced by 10ms).
 *
 * - `url` — endpoint URL. Supports `:name` placeholders filled from `params`.
 * - `method` — HTTP method (default: `'get'`).
 * - `headers` — request headers.
 * - `body` — request body for non-`get` methods.
 * - `queryParams` — query string parameters as a plain object or `HttpParams`.
 * - `params` — values for `:name` URL placeholders (URL-encoded; missing keys throw).
 * - `fallback` — initial signal value AND the value emitted when the request errors.
 */
export type FetcherSignalOptions<
  Result,
  Body,
  Params extends Record<string, string>,
  QueryParams extends Record<string, string> | HttpParams
> = {
  [K in keyof FetcherSignalOptionTypes<Result, Body, Params, QueryParams>]:
    FetcherSignalOptionTypes<Result, Body, Params, QueryParams>[K]
    | Signal<FetcherSignalOptionTypes<Result, Body, Params, QueryParams>[K]>
    | Promise<FetcherSignalOptionTypes<Result, Body, Params, QueryParams>[K]>
    | Observable<FetcherSignalOptionTypes<Result, Body, Params, QueryParams>[K]>;
}

/**
 * A `Signal<Result>` extended with request state and a manual reload trigger.
 *
 * - call the signal to read the latest result (or `fallback` before the first response)
 * - `error` — latest error; reset to `null` on each successful response
 * - `loading` — `true` while a request is in flight, `false` once a value is emitted
 * - `reload()` — re-run the current request without changing options. Returns a
 *   `Promise<void>` that resolves once the next value (response or fallback-on-error)
 *   has been emitted into the signal.
 * - `loaded` — getter returning a fresh `Promise<void>` that resolves the next time
 *   `loading` flips back to `false`. Useful for `await`ing the next response in tests,
 *   route resolvers, or effects without subscribing to signals.
 */
export type FetcherSignal<Result> = Signal<Result> & {
  error: Signal<Error | null>;
  loading: Signal<boolean>;
  reload(): Promise<void>;
  readonly loaded: Promise<void>;
}

/**
 * Creates a reactive HTTP fetcher exposed as a `Signal`.
 *
 * Built on Angular's `HttpClient`. Any reactive option ({@link FetcherSignalOptions})
 * automatically re-triggers the request when it changes. Exposes `loading` and `error`
 * signals plus a `reload()` method.
 *
 * @param options Request configuration. See {@link FetcherSignalOptions}.
 * @param injector Optional `Injector` for use outside an injection context.
 * @returns A {@link FetcherSignal} for the response.
 *
 * @example
 * ```ts
 * const users = fetcherSignal<User[]>({
 *   url: '/api/users',
 *   queryParams: computed(() => ({ q: search() })),
 *   fallback: []
 * });
 *
 * users();          // current value (or fallback)
 * users.loading();  // boolean
 * users.error();    // Error | null
 * await users.loaded;     // wait for the next response
 * await users.reload();   // re-run request and wait for the next response
 * ```
 */
export function fetcherSignal<
  Result = any,
  Body = null,
  Params extends Record<string, string> = {},
  QueryParams extends Record<string, string> | HttpParams = {}
>(
  options: FetcherSignalOptions<Result, Body, Params, QueryParams>,
  injector?: Injector
): FetcherSignal<Result> {
  const client = injector?.get(HttpClient) ?? inject(HttpClient);
  const defaultOptions: OptionDefaults<Result, Body, Params, QueryParams> = {
    url: '',
    method: 'get',
    headers: {},
    body: null!,
    queryParams: {} as QueryParams,
    params: {} as Params,
    fallback: null!
  };

  const {
    url,
    method,
    headers,
    body,
    queryParams,
    params,
    fallback
  } = parseOptions(options);

  const optionsArray = [
    url ?? of(defaultOptions.url),
    method ?? of(defaultOptions.method),
    headers ?? of(defaultOptions.headers),
    body ?? of(defaultOptions.body),
    queryParams ?? of(defaultOptions.queryParams),
    params ?? of(defaultOptions.params)
  ] as const;

  const sharedFallback = (fallback as Observable<Result> ?? of(defaultOptions.fallback)).pipe(shareLast());
  const errorSignal = signal<Error | null>(null);
  const loadingSignal = signal(true);
  const reloadTrigger = new Subject<void>();

  const result$ = combineLatest(optionsArray).pipe(
    map(([url, method, headers, body, queryParams, params]) => ({
      url: url ?? defaultOptions.url,
      method: method ?? defaultOptions.method,
      headers: headers ?? defaultOptions.headers,
      body: body ?? defaultOptions.body,
      queryParams: queryParams ?? defaultOptions.queryParams,
      params: params ?? defaultOptions.params
    })),
    debounceTime(10),
    switchMap(options => reloadTrigger.pipe(mapTo(options), startWith(options))),
    switchMap(({ url, method, headers, body, queryParams, params }) => {
      const finalUrl = parseUrlWithParams(url, params);

      loadingSignal.set(true);

      return client.request<Result>(method, finalUrl, { headers, body, observe: 'body', params: queryParams }).pipe(
        map(response => {
          errorSignal.set(null);
          return response;
        }),
        catchError(error => {
          errorSignal.set(error);
          return sharedFallback;
        }),
        tap(() => loadingSignal.set(false))
      );
    }),
    mergeWith(sharedFallback)
  );

  const resultSignal = toSignal(result$, { initialValue: defaultOptions.fallback });

  return Object.assign(resultSignal, {
    error: errorSignal.asReadonly(),
    loading: loadingSignal.asReadonly(),
    reload() {
      reloadTrigger.next();

      return defer().then(() => this.loaded);
    },
    get loaded() {
      return firstValueFrom(toObservable(loadingSignal).pipe(
        filter(isFalsy),
        mapTo(void 0)
      ))
    }
  });
}

function parseUrlWithParams(url: string, params: Record<string, string>): string {
  return url.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    if (key in params) {
      return encodeURIComponent(params[key]);
    }
    throw new Error(`Missing parameter '${key}' for URL '${url}'`);
  });
}

function parseOptions<
  Result,
  Body,
  Params extends Record<string, string>,
  QueryParams extends Record<string, string> | HttpParams
>(
  options: FetcherSignalOptions<Result, Body, Params , QueryParams>
) {
  return objectMap(options, toObservable) as ParsedFetcherSignalOptions<Result, Body, Params, QueryParams>;
}
