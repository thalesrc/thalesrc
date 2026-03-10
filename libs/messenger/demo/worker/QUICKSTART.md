# Messenger Worker Demo - Quick Start

## 🚀 Running the Demo

```bash
# From the monorepo root
pnpm nx serve messenger-worker-demo
```

The browser will automatically open at `http://localhost:5173`.

## 📁 Project Structure

```
libs/messenger/demo/worker/
├── index.html         # Demo UI with interactive examples
├── main.ts            # Main thread service (extends WorkerMessageService)
├── worker.ts          # Worker thread service (extends WorkerMessageService)
├── vite.config.ts     # Vite configuration with path aliases
├── tsconfig.json      # TypeScript configuration
├── project.json       # Nx project configuration
├── package.json       # Package metadata
└── README.md          # Detailed documentation
```

## 🎯 What This Demo Shows

This demo demonstrates all aspects of the `@telperion/messenger/worker` module:

1. **Main → Worker**: Calculate sum, process items
2. **Worker → Main**: Request data, update progress
3. **Bidirectional**: Both sides can send and receive messages
4. **Real-time**: Progress updates during long-running tasks
5. **Performance**: Ping-pong latency testing

## 🔑 Key Concepts

### Main Thread (main.ts)
```typescript
class MainThreadService extends WorkerMessageService {
  @Request('calculate-sum')
  calculateSum(numbers: number[]): Observable<number> {
    return null!; // Decorator handles implementation
  }

  @Listen('get-data')
  handleGetData(key: string): Observable<any> {
    // Respond to worker requests
    return of(dataStore[key]);
  }
}

const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
const service = new MainThreadService(worker);
```

### Worker Thread (worker.ts)
```typescript
class WorkerThreadService extends WorkerMessageService {
  @Listen('calculate-sum')
  handleCalculateSum(numbers: number[]): Observable<number> {
    return of(numbers.reduce((a, b) => a + b, 0));
  }

  @Request('get-data')
  getData(key: string): Observable<any> {
    return null!; // Request data from main thread
  }
}

const service = new WorkerThreadService(); // No parameter in worker
```

## 💡 Try It Out

Open the demo and try:
1. Calculate Sum: Enter numbers like `1,2,3,4,5`
2. Process Items: Set a count and watch progress updates
3. Request Data: Worker fetches data from main thread
4. Ping-Pong: Test communication latency

Enjoy exploring Messenger! 🔔
