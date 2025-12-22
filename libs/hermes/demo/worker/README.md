# Hermes Worker Demo

This demo showcases the `@thalesrc/hermes/worker` module, demonstrating bidirectional communication between the main thread and a Web Worker using decorators.

## Features Demonstrated

1. **Main → Worker Communication**: Send data to worker for processing
2. **Worker → Main Communication**: Worker requests data from main thread
3. **Progress Updates**: Worker reports progress back to main thread during long-running tasks
4. **Bidirectional Service**: Single class handles both sending and receiving messages

## Demo Scenarios

### 1. Calculate Sum
- **Type**: Main → Worker
- **Description**: Send an array of numbers to the worker, which calculates and returns the sum
- **Demonstrates**: Basic request/response pattern

### 2. Long-running Task with Progress
- **Type**: Main → Worker, Worker → Main
- **Description**: Process items in the worker while reporting progress updates back to main thread
- **Demonstrates**: Observable streams, progress reporting, bidirectional communication

### 3. Worker Requests Data
- **Type**: Worker → Main
- **Description**: Worker initiates a request to fetch data from the main thread
- **Demonstrates**: Reverse communication flow, worker requesting resources from main

### 4. Ping-Pong Test
- **Type**: Main → Worker
- **Description**: Simple latency test measuring round-trip time
- **Demonstrates**: Performance measurement, minimal overhead

## Running the Demo

### Using Nx (Recommended)

From the **monorepo root**:

```bash
# Start the dev server
pnpm nx serve hermes-worker-demo

# Build for production
pnpm nx build hermes-worker-demo

# Preview production build
pnpm nx preview hermes-worker-demo
```

### Using Vite Directly

From the **demo directory**:

```bash
cd libs/hermes/demo/worker

# Start dev server
pnpm vite

# Build for production
pnpm vite build

# Preview production build
pnpm vite preview
```

The demo will automatically open in your browser at `http://localhost:5173`.

## Code Structure

- **`index.html`**: Demo UI with multiple test scenarios
- **`main.ts`**: Main thread service extending `WorkerMessageService`
- **`worker.ts`**: Worker thread service extending `WorkerMessageService`

## Key Concepts

### Decorators

- **`@Request(path)`**: Marks a method as sending a message (used by both main and worker)
- **`@Listen(path)`**: Marks a method as handling incoming messages (used by both main and worker)

### WorkerMessageService

A bidirectional service that combines:
- **`WorkerMessageClient`**: For sending requests
- **`WorkerMessageHost`**: For listening to requests

### Main Thread Initialization

```typescript
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
const service = new MainThreadService(worker);
```

### Worker Thread Initialization

```typescript
const service = new WorkerThreadService(); // No parameter needed
```

## Learn More

- [Hermes README](../../README.md)
- [Worker API Documentation](../../src/worker/README.md)
- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

## Troubleshooting

### Worker Not Loading
- Ensure you're using a dev server that supports ES modules in workers
- Check browser console for CORS errors
- Verify the worker file path is correct

### Messages Not Received
- Check that paths in `@Request` and `@Listen` decorators match
- Ensure the worker is properly initialized before sending messages
- Look for errors in both main thread and worker console logs
