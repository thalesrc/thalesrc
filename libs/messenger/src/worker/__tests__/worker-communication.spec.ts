import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom, take, toArray, Observable, of } from 'rxjs';
import { WorkerMessageClient } from '../message-client';
import { WorkerMessageHost } from '../message-host';
import { Request } from '../../request.decorator';
import { Listen } from '../../listen.decorator';

describe('Worker Communication (Browser)', () => {
  let worker: Worker;
  let mainThreadClient: WorkerMessageClient;
  let mainThreadHost: WorkerMessageHost;

  beforeEach(() => {
    // Create a simple worker inline using Blob and URL
    const workerCode = `
      // Import is not available in inline workers, so we'll handle messages manually
      self.onmessage = function(e) {
        const message = e.data;

        // Echo back messages with a prefix
        if (message.path === 'echo') {
          self.postMessage({
            id: message.id,
            body: 'Worker says: ' + message.body,
            completed: false
          });
          self.postMessage({
            id: message.id,
            completed: true
          });
        }

        // Simple ping-pong
        if (message.path === 'ping') {
          self.postMessage({
            id: message.id,
            body: 'pong',
            completed: false
          });
          self.postMessage({
            id: message.id,
            completed: true
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    worker = new Worker(workerUrl);

    mainThreadClient = new WorkerMessageClient(worker);
    mainThreadHost = new WorkerMessageHost(worker);
  });

  afterEach(() => {
    worker.terminate();
  });

  it('should create worker instances', () => {
    expect(worker).toBeDefined();
    expect(mainThreadClient).toBeDefined();
    expect(mainThreadHost).toBeDefined();
  });

  it('should send message to worker and receive response', async () => {
    class MainAPI extends WorkerMessageClient {
      @Request('echo')
      public echo(message: string): Observable<string> {
        return null!;
      }
    }

    const api = new MainAPI(worker);

    const result = await firstValueFrom(api.echo('Hello'));

    expect(result).toBe('Worker says: Hello');
  });

  it('should handle multiple messages', async () => {
    class MainAPI extends WorkerMessageClient {
      @Request('ping')
      public ping(): Observable<string> {
        return null!;
      }
    }

    const api = new MainAPI(worker);

    const results = await Promise.all([
      firstValueFrom(api.ping()),
      firstValueFrom(api.ping()),
      firstValueFrom(api.ping())
    ]);

    expect(results).toEqual(['pong', 'pong', 'pong']);
  });

  it('should receive messages sent from worker to main thread', () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Test timeout - message not received')), 4000);

      // Create a worker that sends a message to main thread
      const workerCode = `
        // Send a message to main thread immediately
        self.postMessage({
          path: 'test-message',
          id: '123',
          body: 'test data'
        });
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const testWorker = new Worker(workerUrl);

      // Listen for it in the host
      class MainHostAPI extends WorkerMessageHost {
        @Listen('test-message')
        public onTestMessage(data: string) {
          clearTimeout(timeout);
          expect(data).toBe('test data');
          testWorker.terminate();
          resolve();
          return of(void 0);
        }
      }

      new MainHostAPI(testWorker);
    });
  });

  it('should handle worker errors gracefully', async () => {
    const errorWorkerCode = `
      self.onmessage = function(e) {
        throw new Error('Worker error');
      };
    `;

    const blob = new Blob([errorWorkerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const errorWorker = new Worker(workerUrl);

    const errorSpy = vi.fn();
    errorWorker.onerror = errorSpy;

    class ErrorAPI extends WorkerMessageClient {
      @Request('test')
      public test(): Observable<string> {
        return null!;
      }
    }

    const api = new ErrorAPI(errorWorker);

    // Send message that will cause error
    api.test().subscribe({
      error: () => {
        // Expected to error
      }
    });

    // Wait a bit for error to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    errorWorker.terminate();
  });
});
