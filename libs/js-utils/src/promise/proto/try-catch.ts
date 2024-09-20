import { tryCatch } from '../try-catch';

declare global {
  export interface Promise<T> {
    /**
     * #### Promise Try Catch
     *
     * Merges result and error in the same callback
     *
     * * * *
     * Example:
     * ```typescript
     * import "@thalesrc/js-utils/as-proto/promise-try-catch";
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
     * @param defaultResult Setting this will put the value into the result field when the promise throws error
     */
    tryCatch<E = unknown>(defaultResult?: T): Promise<[E, T]>;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Promise.prototype.tryCatch = function(this: Promise<any>, defaultResult?: any): ReturnType<typeof tryCatch<any, any>> {
  return tryCatch(this, defaultResult);
};
