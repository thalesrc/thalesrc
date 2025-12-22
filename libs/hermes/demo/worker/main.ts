import { WorkerMessageService } from '../../src/worker';
import { Request, Listen } from '../../src';
import { Observable, of } from 'rxjs';

/**
 * Main Thread Service
 *
 * This class demonstrates bidirectional communication with a Web Worker.
 * - Uses @Request to send messages to the worker
 * - Uses @Listen to respond to worker requests
 */
class MainThreadService extends WorkerMessageService {
  /**
   * Request: Send numbers to worker for sum calculation
   */
  @Request('calculate-sum')
  calculateSum(numbers: number[]): Observable<number> {
    return null!; // Implementation is handled by the decorator
  }

  /**
   * Request: Start a long-running process in the worker
   */
  @Request('process-items')
  processItems(count: number): Observable<string> {
    return null!;
  }

  /**
   * Request: Simple ping to test latency
   */
  @Request('ping')
  ping(timestamp: number): Observable<number> {
    return null!;
  }

  /**
   * Request: Trigger worker to request data from main
   */
  @Request('trigger-data-request')
  triggerDataRequest(key: string): Observable<any> {
    return null!;
  }

  /**
   * Listen: Worker can request to update progress
   */
  @Listen('update-progress')
  handleProgressUpdate(data: { percent: number; message: string }): Observable<void> {
    const { percent, message } = data;
    updateProgress(percent, message);
    return of(void 0);
  }

  /**
   * Listen: Worker can request data from main thread
   */
  @Listen('get-data')
  handleGetData(key: string): Observable<any> {
    // Simulate fetching data from main thread (e.g., localStorage, IndexedDB)
    const dataStore: Record<string, any> = {
      config: { theme: 'dark', language: 'en' },
      user: { name: 'John Doe', id: 123 },
      settings: { notifications: true, autoSave: false }
    };

    return of(dataStore[key] || null);
  }
}

// Initialize worker and service
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
const service = new MainThreadService(worker);

// UI Helper Functions
function addLog(elementId: string, message: string, type: 'request' | 'response' | 'progress' | 'error' = 'response') {
  const output = document.getElementById(elementId);
  if (output) {
    const log = document.createElement('div');
    log.className = `log ${type}`;
    log.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    output.appendChild(log);
    output.scrollTop = output.scrollHeight;
  }
}

function clearLogs(elementId: string) {
  const output = document.getElementById(elementId);
  if (output) {
    output.innerHTML = '';
  }
}

function updateProgress(percent: number, message: string) {
  const progressFill = document.getElementById('progressFill');
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
    progressFill.textContent = `${percent}%`;
  }
  addLog('processOutput', message, 'progress');
}

// Demo 1: Calculate Sum
document.getElementById('calculateBtn')?.addEventListener('click', () => {
  const input = document.getElementById('numbersInput') as HTMLInputElement;
  const numbers = input.value.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

  clearLogs('calculateOutput');
  addLog('calculateOutput', `Requesting sum of [${numbers.join(', ')}]`, 'request');

  service.calculateSum(numbers).subscribe({
    next: (result) => {
      addLog('calculateOutput', `Result: ${result}`, 'response');
    },
    error: (err) => {
      addLog('calculateOutput', `Error: ${err.message}`, 'error');
    }
  });
});

// Demo 2: Process with Progress
document.getElementById('processBtn')?.addEventListener('click', () => {
  const input = document.getElementById('itemsInput') as HTMLInputElement;
  const count = parseInt(input.value);

  clearLogs('processOutput');
  updateProgress(0, 'Starting...');
  addLog('processOutput', `Starting to process ${count} items`, 'request');

  const btn = document.getElementById('processBtn') as HTMLButtonElement;
  btn.disabled = true;

  service.processItems(count).subscribe({
    next: (result) => {
      addLog('processOutput', `Completed: ${result}`, 'response');
      btn.disabled = false;
    },
    error: (err) => {
      addLog('processOutput', `Error: ${err.message}`, 'error');
      btn.disabled = false;
    }
  });
});

// Demo 3: Trigger Data Request
document.getElementById('fetchBtn')?.addEventListener('click', () => {
  const input = document.getElementById('dataKeyInput') as HTMLInputElement;
  const key = input.value.trim();

  clearLogs('fetchOutput');
  addLog('fetchOutput', `Worker will request '${key}' from main thread`, 'request');

  service.triggerDataRequest(key).subscribe({
    next: (result) => {
      addLog('fetchOutput', `Worker received: ${JSON.stringify(result)}`, 'response');
    },
    error: (err) => {
      addLog('fetchOutput', `Error: ${err.message}`, 'error');
    }
  });
});

// Demo 4: Ping-Pong
document.getElementById('pingBtn')?.addEventListener('click', () => {
  clearLogs('pingOutput');
  const start = Date.now();
  addLog('pingOutput', 'Sending ping...', 'request');

  service.ping(start).subscribe({
    next: (workerTimestamp) => {
      const latency = Date.now() - start;
      addLog('pingOutput', `Pong received! Latency: ${latency}ms`, 'response');
      addLog('pingOutput', `Worker timestamp: ${workerTimestamp}`, 'response');
    },
    error: (err) => {
      addLog('pingOutput', `Error: ${err.message}`, 'error');
    }
  });
});

console.log('Main thread initialized with Worker');
