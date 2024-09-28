/**
 * Extracts the constructor type from an interface.
 */
export type ConstructorType<T> = T extends new (...args: infer P) => infer R ? new (...args: P) => R : never;
