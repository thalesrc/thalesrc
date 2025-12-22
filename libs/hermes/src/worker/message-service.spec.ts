import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, Observable, of } from 'rxjs';
import { WorkerMessageService } from './message-service';
import { Request } from '../request.decorator';
import { Listen } from '../listen.decorator';

describe('WorkerMessageService (Browser)', () => {
  let worker: Worker;

  beforeEach(() => {
    // Create a worker that can both send and receive messages
    const workerCode = `
      // Simple bidirectional worker
      self.onmessage = function(e) {
        const message = e.data;

        // Handle responses to requests we made (responses have completed field or no path)
        if (!message.path || message.completed !== undefined) {
          // This is a response, ignore it
          return;
        }

        // Handle incoming requests
        if (message.path === 'getData') {
          self.postMessage({
            id: message.id,
            body: { data: 'from worker' },
            completed: false
          });
          self.postMessage({
            id: message.id,
            completed: true
          });
        }

        if (message.path === 'calculate') {
          const result = message.body.a + message.body.b;
          self.postMessage({
            id: message.id,
            body: result,
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
  });

  afterEach(() => {
    worker.terminate();
  });

  it('should support bidirectional communication', async () => {
    class MainThreadService extends WorkerMessageService {
      @Request('getData')
      public getData(): Observable<{ data: string }> {
        return null!;
      }

      @Listen('mainThreadMethod')
      public mainThreadMethod(value: string) {
        return of('Response from main: ' + value);
      }
    }

    const service = new MainThreadService(worker);

    const result = await firstValueFrom(service.getData());

    expect(result).toEqual({ data: 'from worker' });
  });

  it('should handle complex data types', async () => {
    class CalculatorService extends WorkerMessageService {
      @Request('calculate')
      public calculate(params: { a: number; b: number }): Observable<number> {
        return null!;
      }
    }

    const service = new CalculatorService(worker);

    const result = await firstValueFrom(service.calculate({ a: 5, b: 3 }));

    expect(result).toBe(8);
  });

  it('should support multiple concurrent requests', async () => {
    class ConcurrentService extends WorkerMessageService {
      @Request('calculate')
      public calculate(params: { a: number; b: number }): Observable<number> {
        return null!;
      }
    }

    const service = new ConcurrentService(worker);

    const results = await Promise.all([
      firstValueFrom(service.calculate({ a: 1, b: 2 })),
      firstValueFrom(service.calculate({ a: 3, b: 4 })),
      firstValueFrom(service.calculate({ a: 5, b: 6 }))
    ]);

    expect(results).toEqual([3, 7, 11]);
  });

  it('should initialize with lazy worker creation', async () => {
    let workerCreated = false;

    const lazyWorker = () => {
      workerCreated = true;
      const workerCode = `
        self.onmessage = function(e) {
          self.postMessage({
            id: e.data.id,
            body: 'lazy',
            completed: false
          });
          self.postMessage({
            id: e.data.id,
            completed: true
          });
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      return new Worker(workerUrl);
    };

    class LazyService extends WorkerMessageService {
      @Request('test')
      public test(): Observable<string> {
        return null!;
      }
    }

    const service = new LazyService(lazyWorker() as any);

    expect(workerCreated).toBe(true);

    const result = await firstValueFrom(service.test());
    expect(result).toBe('lazy');
  });
});
