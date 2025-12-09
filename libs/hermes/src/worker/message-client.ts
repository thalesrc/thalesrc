import { uniqueId } from "@thalesrc/js-utils/unique-id";
import { noop } from "@thalesrc/js-utils/function/noop";
import { promisify } from '@thalesrc/js-utils/promise/promisify';
import { Subject } from "rxjs";
import { MessageClient } from "../message-client";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { GET_NEW_ID, RESPONSES$, SEND } from "../selectors";

type ClientWorkerType = Worker | undefined;
type ClientWorkerPromise = Promise<ClientWorkerType>;
type ClientWorkerFactory = () => ClientWorkerType | ClientWorkerPromise;
type ClientWorkerArg = ClientWorkerType | ClientWorkerPromise | ClientWorkerFactory;

/**
 * WorkerMessageClient
 *
 * Client implementation for Web Worker communication. Sends messages to and receives
 * responses from Web Workers using the Worker postMessage API.
 *
 * This class can be used in two contexts:
 * - **Main thread**: Provide a Worker instance to communicate with that specific worker
 * - **Worker thread**: Omit the worker parameter to communicate with the main thread via self
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
 * // In main thread - communicate with a specific worker
 * const worker = new Worker('./worker.js');
 * const client = new WorkerMessageClient(worker);
 *
 * @example
 * // In worker thread - communicate with main thread
 * const client = new WorkerMessageClient();
 *
 * @example
 * // With async worker initialization
 * const workerPromise = import('./worker.js').then(m => new m.MyWorker());
 * const client = new WorkerMessageClient(workerPromise);
 *
 * @example
 * // With lazy initialization
 * const client = new WorkerMessageClient(() =>
 *   document.querySelector('[data-worker]') ? new Worker('./worker.js') : undefined
 * );
 *
 * @example
 * // Re-initialize with a different worker
 * const client = new WorkerMessageClient();
 * // Later, switch to a different worker
 * client.initialize(new Worker('./different-worker.js'));
 */
export class WorkerMessageClient extends MessageClient {
  /**
   * Promise resolving to the Worker instance or undefined if running in worker context
   * @private
   */
  #worker: ClientWorkerPromise = Promise.resolve(undefined);

  /**
   * Unique identifier for this client instance to prevent ID collisions
   * @private
   */
  #instanceId = Date.now();

  /**
   * Observable stream of message responses from the worker or main thread
   */
  public [RESPONSES$] = new Subject<MessageResponse>();

  /**
   * Creates a new WorkerMessageClient instance
   *
   * @param worker - Optional worker configuration:
   *   - Worker: Direct worker instance (main thread)
   *   - Promise<Worker>: Promise resolving to worker (async initialization)
   *   - () => Worker: Function returning worker (lazy initialization)
   *   - () => Promise<Worker>: Function returning promise (async lazy initialization)
   *   - undefined: Omit for worker thread context (uses self)
   */
  constructor(worker?: ClientWorkerArg) {
    super();

    this.initialize(worker);
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
   * const client = new WorkerMessageClient(oldWorker);
   * client.initialize(newWorker); // Cleans up old listener, sets up new one
   *
   * @example
   * // Re-initialize after worker error
   * worker.onerror = () => {
   *   client.initialize(new Worker('./worker.js'));
   * };
   */
  initialize(worker?: ClientWorkerArg) {
    // Deinitialize previous worker if any
    this.#worker.then(prevWorker => {
      if (prevWorker) {
        prevWorker.removeEventListener('message', this.#handler);
      } else {
        removeEventListener('message', this.#handler);
      }
    }).catch(noop);

    // Resolve worker parameter: execute function if provided, otherwise use value directly
    const _worker: ClientWorkerType | ClientWorkerPromise | undefined = typeof worker === 'function' ? worker() : worker;
    // Ensure worker is wrapped in a promise for consistent async handling
    this.#worker = promisify(_worker);

    // Set up message listener once worker is resolved
    this.#worker.then(worker => {
      if (worker) {
        // Main thread context: listen to specific worker
        worker.addEventListener('message', this.#handler);
      } else {
        // Worker thread context: listen to messages from main thread
        addEventListener('message', this.#handler);
      }
    }).catch(noop);
  }

  /**
   * Sends a message to the worker or main thread
   *
   * @param message - The message to send
   * @template T - Type of the message body
   * @internal Used by @Request decorator
   */
  public [SEND]<T>(message: Message<T>) {
    this.#worker.then(worker => {
      if (worker) {
        // Main thread: send to worker
        worker.postMessage(message);
      } else {
        // Worker thread: send to main thread
        (postMessage as any)(message);
      }
    }).catch(noop);
  }

  /**
   * Handles incoming messages and forwards them to the responses stream
   * @private
   */
  #handler = (event: MessageEvent<MessageResponse>) => {
    this[RESPONSES$].next(event.data);
  }

  /**
   * Generates a unique message ID for tracking request-response pairs
   *
   * @returns Unique message identifier
   * @internal Used by @Request decorator
   */
  protected [GET_NEW_ID](): string {
    return uniqueId('hermes-worker-message-' + this.#instanceId) as string;
  }
}
