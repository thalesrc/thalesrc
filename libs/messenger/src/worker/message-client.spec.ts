import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import { WorkerMessageClient } from './message-client';
import { Request } from '../request.decorator';
import { MessageResponse } from '../message-response.type';

describe('WorkerMessageClient', () => {
  let mockWorker: {
    postMessage: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockWorker = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      terminate: vi.fn(),
    };
  });

  it('should create an instance', () => {
    const client = new WorkerMessageClient(mockWorker as any);
    expect(client).toBeInstanceOf(WorkerMessageClient);
  });

  it('should create an instance without worker (worker context)', () => {
    const client = new WorkerMessageClient();
    expect(client).toBeInstanceOf(WorkerMessageClient);
  });

  it('should send messages to worker', async () => {
    const client = new WorkerMessageClient(mockWorker as any);

    class TestAPI extends WorkerMessageClient {
      @Request('test')
      public testMethod(data: string): Observable<string> {
        return null!;
      }
    }

    const api = new TestAPI(mockWorker as any);

    // Trigger the request (won't wait for response in this unit test)
    const observable = api.testMethod('hello');

    // Wait a tick for async initialization
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify postMessage was called
    expect(mockWorker.postMessage).toHaveBeenCalled();
    const sentMessage = mockWorker.postMessage.mock.calls[0][0];
    expect(sentMessage.path).toBe('test');
    expect(sentMessage.body).toBe('hello');
    expect(sentMessage.id).toBeDefined();
  });

  it('should handle responses from worker', async () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;

    mockWorker.addEventListener = vi.fn().mockImplementation((event: string, handler: any) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    }) as any;

    class TestAPI extends WorkerMessageClient {
      @Request('echo')
      public echo(msg: string): Observable<string> {
        return null!;
      }
    }

    const api = new TestAPI(mockWorker as any);

    // Start the request
    const resultPromise = firstValueFrom(api.echo('test'));

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 10));

    // Get the message ID that was sent
    expect(mockWorker.postMessage).toHaveBeenCalled();
    const sentMessage = mockWorker.postMessage.mock.calls[0][0];

    // Simulate worker response
    if (messageHandler) {
      // Send data response
      messageHandler(new MessageEvent('message', {
        data: {
          id: sentMessage.id,
          body: 'response data',
          completed: false,
        } as MessageResponse,
      }));

      // Send completion
      messageHandler(new MessageEvent('message', {
        data: {
          id: sentMessage.id,
          completed: true,
        } as MessageResponse,
      }));
    }

    const result = await resultPromise;
    expect(result).toBe('response data');
  });

  it('should generate unique message IDs', () => {
    const client = new WorkerMessageClient(mockWorker as any);

    class TestAPI extends WorkerMessageClient {
      @Request('test')
      public test(): Observable<void> {
        return null!;
      }
    }

    const api = new TestAPI(mockWorker as any);

    // Send multiple messages
    api.test();
    api.test();
    api.test();

    // Check that all IDs are unique
    const calls = mockWorker.postMessage.mock.calls;
    const ids = calls.map((call: any) => call[0].id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should handle worker passed as Promise', async () => {
    const workerPromise = Promise.resolve(mockWorker as any);
    const client = new WorkerMessageClient(workerPromise);

    class TestAPI extends WorkerMessageClient {
      @Request('test')
      public test(): Observable<void> {
        return null!;
      }
    }

    const api = new TestAPI(workerPromise);
    api.test();

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(mockWorker.postMessage).toHaveBeenCalled();
  });

  it('should handle worker passed as function', async () => {
    const workerFactory = vi.fn(() => mockWorker as any);
    const client = new WorkerMessageClient(workerFactory);

    class TestAPI extends WorkerMessageClient {
      @Request('test')
      public test(): Observable<void> {
        return null!;
      }
    }

    const api = new TestAPI(workerFactory);
    api.test();

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(workerFactory).toHaveBeenCalled();
    expect(mockWorker.postMessage).toHaveBeenCalled();
  });

  it('should handle worker passed as async function', async () => {
    const asyncWorkerFactory = vi.fn(async () => mockWorker as any);
    const client = new WorkerMessageClient(asyncWorkerFactory);

    class TestAPI extends WorkerMessageClient {
      @Request('test')
      public test(): Observable<void> {
        return null!;
      }
    }

    const api = new TestAPI(asyncWorkerFactory);
    api.test();

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(asyncWorkerFactory).toHaveBeenCalled();
    expect(mockWorker.postMessage).toHaveBeenCalled();
  });

  it('should allow re-initialization with different worker', async () => {
    const mockWorker2 = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      terminate: vi.fn(),
    };

    const client = new WorkerMessageClient(mockWorker as any);

    class TestAPI extends WorkerMessageClient {
      @Request('test')
      public test(): Observable<void> {
        return null!;
      }
    }

    const api = new TestAPI(mockWorker as any);
    api.test();

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockWorker.postMessage).toHaveBeenCalled();
    mockWorker.postMessage.mockClear();

    // Re-initialize with different worker
    api.initialize(mockWorker2 as any);
    api.test();

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockWorker.postMessage).not.toHaveBeenCalled();
    expect(mockWorker2.postMessage).toHaveBeenCalled();
  });

  it('should use postMessage directly in worker context', async () => {
    // Mock global postMessage for worker context
    const globalPostMessage = vi.fn();
    (globalThis as any).postMessage = globalPostMessage;

    const client = new WorkerMessageClient(); // No worker = worker context

    class TestAPI extends WorkerMessageClient {
      @Request('test')
      public test(data: string): Observable<void> {
        return null!;
      }
    }

    const api = new TestAPI();
    api.test('worker-data');

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(globalPostMessage).toHaveBeenCalled();
    const sentMessage = globalPostMessage.mock.calls[0][0];
    expect(sentMessage.path).toBe('test');
    expect(sentMessage.body).toBe('worker-data');

    // Clean up
    delete (globalThis as any).postMessage;
  });
});
