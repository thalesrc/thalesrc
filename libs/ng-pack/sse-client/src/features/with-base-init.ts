import { SseFeature, SseFeatureKind } from "./feature";
import { SseInterceptorFunctionFeature } from "./with-interceptors";

/**
 * Configures default EventSource initialization options for the SSE client.
 * Merges the provided options into every SSE request's `init` via an interceptor.
 *
 * @param init - Partial EventSource initialization options to apply as defaults
 * @returns Array of SSE features to be used with `provideSseClient()`
 *
 * @example
 * ```typescript
 * provideSseClient(
 *   withBaseInit({ withCredentials: true })
 * )
 * ```
 */
export function withBaseInit(init: Partial<EventSourceInit>): SseFeature[] {
  return [
    <SseInterceptorFunctionFeature>{
      kind: SseFeatureKind.InterceptorFunction,
      interceptor(req, next) {
        return next({
          ...req,
          init: {
            ...req.init,
            ...init
          }
        })
      }
    }
  ]
}
