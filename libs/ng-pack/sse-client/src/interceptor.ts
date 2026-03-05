import { InjectionToken } from "@angular/core";
import type { Observable } from "rxjs";

/**
 * Represents an SSE request with URL and initialization options.
 */
export interface SseRequest {
  url: string;
  init: EventSourceInit;
}

/**
 * Function type for passing the request to the next handler in the interceptor chain.
 */
export type SseNextFn<T> = (request: SseRequest) => Observable<T>;

/**
 * Functional interceptor type for intercepting SSE requests.
 * Interceptors can modify requests, handle errors, add logging, etc.
 *
 * @example
 * ```typescript
 * const loggingInterceptor: SseInterceptorFn<any> = (req, next) => {
 *   console.log('SSE Request:', req.url);
 *   return next(req);
 * };
 * ```
 */
export type SseInterceptorFn<T> = (
  request: SseRequest,
  next: SseNextFn<T>
) => Observable<T>;

/**
 * Class-based interceptor interface for SSE requests.
 * Implements the same pattern as Angular's HttpInterceptor.
 */
export interface SseInterceptor<T = unknown> {
  sseIntercept<U = T>(...args: Parameters<SseInterceptorFn<U>>): ReturnType<SseInterceptorFn<U>>;
}

/**
 * Injection token for providing SSE interceptors.
 * Use with multi: true to provide multiple interceptors.
 */
export const SSE_INTERCEPTORS = new InjectionToken<SseInterceptor<unknown>[]>('Telperion/SSE_INTERCEPTORS');
