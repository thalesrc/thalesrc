/**
 * Converts a promise or a value to a promise to ensure that the return value is a promise
 *
 * @param promiseOrValue The promise or value to convert to a promise
 * @returns The promise of the given promise or value
 */
export function promisify<T>(promiseOrValue: T | Promise<T>): Promise<T> {
  return Promise.resolve().then(() => promiseOrValue);
}
