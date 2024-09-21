/**
 * #### Try Catch
 *
 * Merges result and error in the same callback
 *
 * * * *
 * Example:
 * ```typescript
 * import { tryCatch } from "@thalesrc/js-utils/promise";
 *
 * async function fooFunction() {
 *   const promise = anAsyncCall();
 *   const [error, result] = await tryCatch(promise);
 *
 *   if (error) {
 *     // handle error
 *   }
 *
 *   // do stuff
 * }
 *
 * ```
 *
 * Prototype Example:
 * ```typescript
 * import "@thalesrc/js-utils/promise/proto/try-catch";
 *
 * async function fooFunction() {
 *   const [error, result] = await anAsyncCall().tryCatch();
 *
 *   if (error) {
 *     // handle error
 *   }
 *
 *   // do stuff
 * }
 *
 * ```
 * * * *
 * @param promise Promise to try
 * @param defaultResult Setting this will put the value into the result field when the promise throws error
 * @returns Error and result array
 */
export async function tryCatch<T, E = unknown>(promise: Promise<T>): Promise<[E | null, T | null]>
export async function tryCatch<T, E = unknown>(promise: Promise<T>, defaultResult: T): Promise<[E | null, T]>
export async function tryCatch<T, E = unknown>(promise: Promise<T>, defaultResult?: T): Promise<[E | null, T | null]> {
  try {
    const result = await promise;

    return [null, result];
  } catch (error) {
    return [error as E, defaultResult ?? null];
  }
}
