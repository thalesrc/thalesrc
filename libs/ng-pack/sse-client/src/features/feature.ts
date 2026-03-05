/**
 * Enum identifying different types of SSE features.
 */
export enum SseFeatureKind {
  InterceptorFunction
}

/**
 * Base interface for SSE feature configurations.
 */
export interface SseFeature {
  kind: SseFeatureKind;
}
