import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { WorkerMessageHost } from './message-host';
import { Listen } from '../listen.decorator';
import { Message } from '../message.interface';

describe('WorkerMessageHost', () => {
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
    const host = new WorkerMessageHost(mockWorker as any);
    expect(host).toBeInstanceOf(WorkerMessageHost);
  });

  it('should create an instance without worker (worker context)', () => {
    const host = new WorkerMessageHost();
    expect(host).toBeInstanceOf(WorkerMessageHost);
  });

  it('should listen for messages from worker', async () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;

    mockWorker.addEventListener = vi.fn().mockImplementation((event: string, handler: any) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    }) as any;

    const handlerFn = vi.fn((data: string) => of('response'));

    class TestHost extends WorkerMessageHost {
      @Listen('test-path')
      public handleTest(data: string) {
        return handlerFn(data);
      }
    }

    const host = new TestHost(mockWorker as any);

    await new Promise(resolve => setTimeout(resolve, 10));

    // Simulate incoming message from worker
    if (messageHandler) {
      messageHandler(new MessageEvent('message', {
        data: {
          id: 'msg-123',
          path: 'test-path',
          body: 'test data',
        } as Message,
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(handlerFn).toHaveBeenCalledWith('test data');
  });

  it('should send responses back to worker', async () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;

    mockWorker.addEventListener = vi.fn().mockImplementation((event: string, handler: any) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    }) as any;

    class TestHost extends WorkerMessageHost {
      @Listen('echo')
      public handleEcho(data: string) {
        return of('Response: ' + data);
      }
    }

    const host = new TestHost(mockWorker as any);

    await new Promise(resolve => setTimeout(resolve, 10));

    // Simulate incoming message
    if (messageHandler) {
      messageHandler(new MessageEvent('message', {
        data: {
          id: 'msg-456',
          path: 'echo',
          body: 'hello',
        } as Message,
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 20));

    // Verify response was sent
    expect(mockWorker.postMessage).toHaveBeenCalled();

    // Find the response with body (not just completion)
    const responseCalls = mockWorker.postMessage.mock.calls;
    const dataResponse = responseCalls.find((call: any) =>
      call[0].id === 'msg-456' && call[0].body !== undefined
    );

    expect(dataResponse).toBeDefined();
    expect(dataResponse![0].body).toBe('Response: hello');
  });

  it('should handle multiple listeners', async () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;

    mockWorker.addEventListener = vi.fn().mockImplementation((event: string, handler: any) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    }) as any;

    const handler1 = vi.fn((data: any) => of('response1'));
    const handler2 = vi.fn((data: any) => of('response2'));

    class TestHost extends WorkerMessageHost {
      @Listen('path1')
      public handlePath1(data: any) {
        return handler1(data);
      }

      @Listen('path2')
      public handlePath2(data: any) {
        return handler2(data);
      }
    }

    const host = new TestHost(mockWorker as any);

    await new Promise(resolve => setTimeout(resolve, 10));

    // Send message to path1
    if (messageHandler) {
      messageHandler(new MessageEvent('message', {
        data: { id: '1', path: 'path1', body: 'data1' } as Message,
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 10));

    // Send message to path2
    if (messageHandler) {
      messageHandler(new MessageEvent('message', {
        data: { id: '2', path: 'path2', body: 'data2' } as Message,
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(handler1).toHaveBeenCalledWith('data1');
    expect(handler2).toHaveBeenCalledWith('data2');
  });

  it('should handle errors in listener methods', async () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;

    mockWorker.addEventListener = vi.fn().mockImplementation((event: string, handler: any) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    }) as any;

    class TestHost extends WorkerMessageHost {
      @Listen('error-path')
      public handleError(data: any) {
        return throwError(() => new Error('Handler error'));
      }
    }

    const host = new TestHost(mockWorker as any);

    await new Promise(resolve => setTimeout(resolve, 10));

    // Send message that will trigger error
    if (messageHandler) {
      messageHandler(new MessageEvent('message', {
        data: { id: 'error-1', path: 'error-path', body: {} } as Message,
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 20));

    // Verify error response was sent
    expect(mockWorker.postMessage).toHaveBeenCalled();
    const errorResponse = mockWorker.postMessage.mock.calls.find((call: any) =>
      call[0].id === 'error-1' && call[0].error
    );
    expect(errorResponse).toBeDefined();
  });

  it('should terminate and cleanup listeners', async () => {
    const host = new WorkerMessageHost(mockWorker as any);

    await new Promise(resolve => setTimeout(resolve, 10));

    host.terminate();

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockWorker.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should handle worker passed as Promise', async () => {
    const workerPromise = Promise.resolve(mockWorker as any);

    workerPromise.then(w => {
      w.addEventListener('message', expect.any(Function));
    });

    const host = new WorkerMessageHost(workerPromise as any);

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(mockWorker.addEventListener).toHaveBeenCalled();
  });

  it('should handle worker passed as function', async () => {
    const workerFactory = vi.fn(() => mockWorker as any);

    const host = new WorkerMessageHost(workerFactory as any);

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(workerFactory).toHaveBeenCalled();
    expect(mockWorker.addEventListener).toHaveBeenCalled();
  });

  it('should allow re-initialization with different worker', async () => {
    const mockWorker2 = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      terminate: vi.fn(),
    };

    const host = new WorkerMessageHost(mockWorker as any);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockWorker.addEventListener).toHaveBeenCalled();

    // Re-initialize with different worker
    host.initialize(mockWorker2 as any);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockWorker2.addEventListener).toHaveBeenCalled();
    // The old worker's listener should have been removed during re-initialization
    expect(mockWorker.removeEventListener).toHaveBeenCalled();
  });

  it('should use postMessage directly in worker context', async () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;
    const globalAddEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    });
    const globalPostMessage = vi.fn();

    (globalThis as any).addEventListener = globalAddEventListener;
    (globalThis as any).postMessage = globalPostMessage;

    class TestHost extends WorkerMessageHost {
      @Listen('test')
      public handleTest(data: string) {
        return of('worker response: ' + data);
      }
    }

    const host = new TestHost(); // No worker = worker context

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(globalAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));

    // Simulate message from main thread
    if (messageHandler) {
      messageHandler(new MessageEvent('message', {
        data: { id: 'worker-msg', path: 'test', body: 'data' } as Message,
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(globalPostMessage).toHaveBeenCalled();
    const responses = globalPostMessage.mock.calls;
    const dataResponse = responses.find((call: any) =>
      call[0].id === 'worker-msg' && call[0].body
    );
    expect(dataResponse[0].body).toBe('worker response: data');

    // Clean up
    delete (globalThis as any).addEventListener;
    delete (globalThis as any).postMessage;
  });

  it('should handle terminate in worker context', async () => {
    const globalRemoveEventListener = vi.fn();
    (globalThis as any).removeEventListener = globalRemoveEventListener;

    const host = new WorkerMessageHost(); // Worker context

    await new Promise(resolve => setTimeout(resolve, 10));

    host.terminate();

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(globalRemoveEventListener).toHaveBeenCalledWith('message', expect.any(Function));

    // Clean up
    delete (globalThis as any).removeEventListener;
  });
});
