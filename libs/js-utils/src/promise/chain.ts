/**
 * Chains promises in a sequential order
 *
 * @param promises The promise returning functions array in the order they should be executed
 * @returns A promise that resolves when all the promises in the array are resolved. The promise resolves with the value of the last promise in the array
 */
export function chain<T>(promises: (() => Promise<T>)[]): Promise<T> {
  return promises.reduce<Promise<T>>((promise, next) => promise.then(next), Promise.resolve(null!));
}
