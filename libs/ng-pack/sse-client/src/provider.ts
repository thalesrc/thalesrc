import { Provider } from "@angular/core";

import { SseClient } from "./client";
import { SseFeature, SseFeatureKind, SseInterceptorFunctionFeature } from "./features";
import { SSE_INTERCEPTORS } from "./interceptor";

/**
 * Provides the SseClient service with optional features.
 * Configure SSE client with interceptors and other features using a functional API.
 *
 * @param features - Optional feature configurations (e.g., withSseInterceptors())
 * @returns Array of Angular providers
 *
 * @example
 * ```typescript
 * import { provideSseClient, withSseInterceptors } from '@telperion/ng-pack/sse-client';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideSseClient(
 *       withSseInterceptors(loggingInterceptor, authInterceptor)
 *     )
 *   ]
 * };
 * ```
 */
export function provideSseClient(...features: SseFeature[][]): Provider[] {
  const interceptorFns = features
    .flat()
    .filter(feature => feature.kind === SseFeatureKind.InterceptorFunction)
    .map(feature => ({
      provide: SSE_INTERCEPTORS,
      useValue: {
        sseIntercept: (feature as SseInterceptorFunctionFeature).interceptor,
      },
      multi: true,
    }));

  return [
    {
      provide: SseClient,
      useClass: SseClient
    },
    ...interceptorFns
  ];
}
