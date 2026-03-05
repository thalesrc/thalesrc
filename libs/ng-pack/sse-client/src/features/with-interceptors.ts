import { SseInterceptorFn } from "../interceptor";
import { SseFeature, SseFeatureKind } from "./feature";

/**
 * Feature interface for functional interceptors.
 * @internal
 */
export interface SseInterceptorFunctionFeature extends SseFeature {
  kind: SseFeatureKind.InterceptorFunction;
  interceptor: SseInterceptorFn<unknown>;
}

/**
 * Configures functional interceptors for the SSE client.
 * Interceptors are executed in the order they are provided.
 *
 * @param interceptors - One or more functional interceptor functions
 * @returns Array of SSE features to be used with provideSseClient()
 *
 * @example
 * ```typescript
 * const loggingInterceptor: SseInterceptorFn<any> = (req, next) => {
 *   console.log('Connecting to:', req.url);
 *   return next(req);
 * };
 *
 * provideSseClient(
 *   withSseInterceptors(loggingInterceptor)
 * )
 * ```
 */
export function withSseInterceptors<T = unknown>(...interceptors: SseInterceptorFn<T>[]): SseFeature[] {
  return interceptors.map(interceptor => ({
    kind: SseFeatureKind.InterceptorFunction,
    interceptor,
  }));
}
