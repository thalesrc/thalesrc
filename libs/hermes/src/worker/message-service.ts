import { mixin } from "@thalesrc/js-utils/class/mixin";
import { WorkerMessageClient } from "./message-client";
import { WorkerMessageHost } from "./message-host";
import { ClientWorkerArg } from "./initializer";

/**
 * WorkerMessageService
 *
 * Bidirectional communication service for Web Workers that combines both client and host
 * capabilities. This class extends both WorkerMessageClient and WorkerMessageHost through
 * mixin composition, enabling full duplex communication - it can both send messages and
 * respond to incoming requests simultaneously.
 *
 * This class is useful when you need a single instance to handle both:
 * - **Sending messages**: Using the @Request decorator to call methods on the other side
 * - **Receiving messages**: Using the @Response decorator to handle incoming requests
 *
 * Like its parent classes, this can be used in two contexts:
 * - **Main thread**: Provide a Worker instance for bidirectional communication with that worker
 * - **Worker thread**: Omit the worker parameter for bidirectional communication with main thread
 *
 * The worker parameter supports multiple types for flexibility:
 * - Direct Worker instance
 * - Promise that resolves to a Worker (for async worker initialization)
 * - Function that returns a Worker (for lazy initialization)
 * - Function that returns a Promise<Worker> (for async lazy initialization)
 *
 * @example
 * // In main thread - full duplex communication with worker
 * const worker = new Worker('./worker.js');
 * const service = new WorkerMessageService(worker);
 *
 * class MainAPI extends WorkerMessageService {
 *   // Send messages to worker
 *   @Request() fetchData!: () => Promise<Data>;
 *
 *   // Respond to worker requests
 *   @Response() async saveToLocalStorage(data: any) {
 *     localStorage.setItem('data', JSON.stringify(data));
 *   }
 * }
 *
 * @example
 * // In worker thread - full duplex communication with main thread
 * const service = new WorkerMessageService();
 *
 * class WorkerAPI extends WorkerMessageService {
 *   // Respond to main thread requests
 *   @Response() async fetchData(): Promise<Data> {
 *     return await fetch('/api/data').then(r => r.json());
 *   }
 *
 *   // Send messages to main thread
 *   @Request() saveToLocalStorage!: (data: any) => Promise<void>;
 * }
 *
 * @example
 * // With async worker initialization
 * const workerPromise = import('./worker.js').then(m => new m.MyWorker());
 * const service = new WorkerMessageService(workerPromise);
 *
 * @example
 * // Re-initialize with a different worker
 * const service = new WorkerMessageService();
 * // Later, switch to a different worker
 * service.initialize(new Worker('./different-worker.js'));
 */
export class WorkerMessageService extends mixin(WorkerMessageHost, WorkerMessageClient) {
  /**
   * Creates a new WorkerMessageService instance with bidirectional communication
   *
   * @param worker - Optional worker configuration:
   *   - Worker: Direct worker instance (main thread)
   *   - Promise<Worker>: Promise resolving to worker (async initialization)
   *   - () => Worker: Function returning worker (lazy initialization)
   *   - () => Promise<Worker>: Function returning promise (async lazy initialization)
   *   - undefined: Omit for worker thread context (uses self)
   */
  constructor(worker?: Worker) {
    super([worker], [worker]);
  }

  /**
   * Initializes or re-initializes the worker connection for both client and host.
   *
   * This method sets up message listeners for both sending and receiving messages.
   * If a worker was previously initialized, it cleans up the old connections before
   * establishing new ones. This allows for dynamic worker management.
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
   * const service = new WorkerMessageService(oldWorker);
   * service.initialize(newWorker); // Cleans up old listeners, sets up new ones
   *
   * @example
   * // Re-initialize after worker error
   * worker.onerror = () => {
   *   service.initialize(new Worker('./worker.js'));
   * };
   */
  public override initialize = (worker: ClientWorkerArg): void => {
    WorkerMessageHost.prototype.initialize.call(this, worker);
    WorkerMessageClient.prototype.initialize.call(this, worker);
  };
}
