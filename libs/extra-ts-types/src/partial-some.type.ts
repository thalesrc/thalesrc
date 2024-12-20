/**
 * Make some properties of an object optional.
 */
export type PartialSome<T extends object, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
