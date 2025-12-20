import { Subject } from "rxjs";
import { MessageHost } from "../message-host";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { LISTEN, RESPONSE } from "../selectors";
import { ClientWorkerArg, ClientWorkerPromise, initializer } from "./initializer";
import { noop } from "@thalesrc/js-utils/function/noop";

const WORKER = Symbol('Host Worker');
const HANDLER = Symbol('Host Message Handler');
const REQUESTS$ = Symbol('Host Requests Stream');

/**
 * WorkerMessageHost
 *
 * Host implementation for Web Worker communication. Receives messages from and sends
 * responses to Web Workers using the Worker postMessage API.
 *
 * This class can be used in two contexts:
 * - **Main thread**: Provide a Worker instance to receive messages from that specific worker
 * - **Worker thread**: Omit the worker parameter to receive messages from the main thread via self
 *
 * The worker parameter supports multiple types for flexibility:
 * - Direct Worker instance
 * - Promise that resolves to a Worker (for async worker initialization)
 * - Function that returns a Worker (for lazy initialization)
 * - Function that returns a Promise<Worker> (for async lazy initialization)
 *
 * The `initialize()` method allows dynamic worker management, enabling you to switch
 * workers at runtime or re-establish connections after errors.
 *
 * @example
 * // In main thread - receive messages from a specific worker
 * const worker = new Worker('./worker.js');
 * const host = new WorkerMessageHost(worker);
 *
 * @example
 * // In worker thread - receive messages from main thread
 * const host = new WorkerMessageHost();
 *
 * @example
 * // With async worker initialization
 * const workerPromise = import('./worker.js').then(m => new m.MyWorker());
 * const host = new WorkerMessageHost(workerPromise);
 *
 * @example
 * // With lazy initialization
 * const host = new WorkerMessageHost(() =>
 *   document.querySelector('[data-worker]') ? new Worker('./worker.js') : undefined
 * );
 *
 * @example
 * // Re-initialize with a different worker
 * const host = new WorkerMessageHost();
 * // Later, switch to a different worker
 * host.initialize(new Worker('./different-worker.js'));
 */
export class WorkerMessageHost extends MessageHost {
  /**
   * Observable stream of incoming messages from the worker or main thread
   * @private
   */
  private [REQUESTS$] = new Subject<Message>();

  /**
   * Promise resolving to the Worker instance or undefined if running in worker context
   * @private
   */
  private [WORKER]: ClientWorkerPromise = Promise.resolve(undefined);

  /**
   * Creates a new WorkerMessageHost instance
   *
   * @param worker - Optional worker configuration:
   *   - Worker: Direct worker instance (main thread)
   *   - Promise<Worker>: Promise resolving to worker (async initialization)
   *   - () => Worker: Function returning worker (lazy initialization)
   *   - () => Promise<Worker>: Function returning promise (async lazy initialization)
   *   - undefined: Omit for worker thread context (uses self)
   */
  constructor(worker?: Worker) {
    super();

    this.initialize(worker);
    this[LISTEN](this[REQUESTS$]);
  }

  /**
   * Initializes or re-initializes the worker connection.
   *
   * This method sets up message listeners for the provided worker. If a worker
   * was previously initialized, it cleans up the old connection before establishing
   * the new one. This allows for dynamic worker management, such as:
   * - Switching between different workers at runtime
   * - Re-establishing connections after worker errors
   * - Lazy initialization when the worker is conditionally needed
   *
   * @param worker - Optional worker configuration:
   *   - Worker: Direct worker instance (main thread)
   *   - Promise<Worker>: Promise resolving to worker (async initialization)
   *   - () => Worker: Function returning worker (lazy initialization)
   *   - () => Promise<Worker>: Function returning promise (async lazy initialization)
   *   - undefined: Omit for worker thread context (uses self)
   *
   * @example
   * // Switch to a different worker dynamically
   * const host = new WorkerMessageHost(oldWorker);
   * host.initialize(newWorker); // Cleans up old listener, sets up new one
   *
   * @example
   * // Re-initialize after worker error
   * worker.onerror = () => {
   *   host.initialize(new Worker('./worker.js'));
   * };
   */
  initialize(worker: ClientWorkerArg) {
    this[WORKER] = initializer(
      this[WORKER],
      worker,
      this[HANDLER]
    );
  }

  /**
   * Sends a response message back to the worker or main thread
   *
   * @param message - The response message to send
   * @internal Used by the message handling system to send responses
   */
  protected [RESPONSE](message: MessageResponse) {
    this[WORKER].then(worker => {
      if (worker) {
        worker.postMessage(message);
      } else {
        (postMessage as any)(message);
      }
    }).catch(noop);
  }

  /**
   * Terminates the worker connection and cleans up message listeners.
   *
   * This method should be called when you're done with the host to prevent memory leaks.
   * It removes the message event listener from either the Worker instance (main thread)
   * or the global scope (worker thread).
   *
   * @example
   * // Clean up when done
   * const host = new WorkerMessageHost(worker);
   * // ... use the host ...
   * host.terminate(); // Clean up listeners
   */
  public terminate() {
    this[WORKER].then(worker => {
      if (worker) {
        worker.removeEventListener('message', this[HANDLER]);
      } else {
        removeEventListener('message', this[HANDLER]);
      }
    }).catch(noop);
  }

  /**
   * Handles incoming messages and forwards them to the requests stream
   * @private
   */
  private [HANDLER] = (event: MessageEvent<Message>) => {
    this[REQUESTS$].next(event.data);
  };
}
