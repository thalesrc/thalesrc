import { noop } from "@thalesrc/js-utils/function/noop";
import { promisify } from "@thalesrc/js-utils/promise/promisify";

export type ClientWorkerType = Worker | undefined;
export type ClientWorkerPromise = Promise<ClientWorkerType>;
export type ClientWorkerFactory = () => ClientWorkerType | ClientWorkerPromise;
export type ClientWorkerArg = ClientWorkerType | ClientWorkerPromise | ClientWorkerFactory;

/**
 * Initializes a Web Worker or the worker context for message communication.
 * @param prevWorker The previous worker promise to deinitialize
 * @param worker The new worker argument (Worker instance, promise, or factory function)
 * @param handler The message event handler to attach
 * @returns A promise resolving to the initialized Worker or undefined if in worker context
 */
export function initializer(
  prevWorker: ClientWorkerPromise,
  worker: ClientWorkerArg,
  handler: (event: MessageEvent) => void
) {
  // Deinitialize previous worker if any
  prevWorker.then(pw => {
    if (pw) {
      pw.removeEventListener('message', handler);
    } else {
      removeEventListener('message', handler);
    }
  }).catch(noop);

  // Resolve worker parameter: execute function if provided, otherwise use value directly
  const _worker: ClientWorkerType | ClientWorkerPromise | undefined = typeof worker === 'function' ? worker() : worker;
  // Ensure worker is wrapped in a promise for consistent async handling
  const newWorker = promisify(_worker);

  // Set up message listener once worker is resolved
  newWorker.then(worker => {
    if (worker) {
      // Main thread context: listen to specific worker
      worker.addEventListener('message', handler);
    } else {
      // Worker thread context: listen to messages from main thread
      addEventListener('message', handler);
    }
  }).catch(noop);

  return newWorker;
}
