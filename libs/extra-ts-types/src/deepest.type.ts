/**
 * Get the deepest type of a nested object
 */
export type DeepestValue<T, K extends keyof T> = T[K] extends Record<K, any> ? DeepestValue<T[K], K> : T[K];

/**
 * Get the deepest object of a nested object
 */
export type DeepestObject<T, K extends keyof T> = T[K] extends Record<K, infer R> ? K extends keyof R ? DeepestObject<R, K> : R : never;

