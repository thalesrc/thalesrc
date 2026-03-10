import { WorkerMessageService } from '../../src/worker';
import { Request, Listen } from '../../src';
import { Observable, of } from 'rxjs';

/**
 * Worker Thread Service
 *
 * This class demonstrates bidirectional communication from within a Web Worker.
 * - Uses @Listen to respond to requests from main thread
 * - Uses @Request to send messages back to main thread
 */
class WorkerThreadService extends WorkerMessageService {
  /**
   * Listen: Calculate sum of numbers
   */
  @Listen('calculate-sum')
  handleCalculateSum(numbers: number[]): Observable<number> {
    console.log('[Worker] Calculating sum of:', numbers);
    const sum = numbers.reduce((acc: number, num: number) => acc + num, 0);
    return of(sum);
  }

  /**
   * Listen: Process items with progress updates
   */
  @Listen('process-items')
  handleProcessItems(count: number): Observable<string> {
    console.log('[Worker] Processing', count, 'items');

    // Simulate long-running task with progress updates
    return new Observable(subscriber => {
      let processed = 0;

      const interval = setInterval(() => {
        processed += Math.floor(Math.random() * 5) + 1;

        if (processed >= count) {
          processed = count;

          // Send final progress update
          this.updateProgress(100, `Completed all ${count} items`).subscribe();

          // Complete the observable
          subscriber.next(`Successfully processed ${count} items`);
          subscriber.complete();
          clearInterval(interval);
        } else {
          const percent = Math.floor((processed / count) * 100);
          // Report progress to main thread
          this.updateProgress(percent, `Processed ${processed}/${count} items`).subscribe();
        }
      }, 100);

      return () => clearInterval(interval);
    });
  }

  /**
   * Listen: Simple ping response
   */
  @Listen('ping')
  handlePing(mainTimestamp: number): Observable<number> {
    console.log('[Worker] Received ping at:', mainTimestamp);
    return of(Date.now());
  }

  /**
   * Listen: Trigger a request from worker to main thread
   */
  @Listen('trigger-data-request')
  handleTriggerDataRequest(key: string): Observable<any> {
    console.log('[Worker] Requesting data for key:', key);

    // Worker requests data from main thread
    return new Observable(subscriber => {
      this.getData(key).subscribe({
        next: (data) => {
          console.log('[Worker] Received data from main:', data);
          subscriber.next(data);
          subscriber.complete();
        },
        error: (err) => {
          console.error('[Worker] Error getting data:', err);
          subscriber.error(err);
        }
      });
    });
  }

  /**
   * Request: Send progress update to main thread
   */
  @Request('update-progress')
  updateProgress(percent: number, message: string): Observable<void> {
    return null!;
  }

  /**
   * Request: Request data from main thread
   */
  @Request('get-data')
  getData(key: string): Observable<any> {
    return null!;
  }
}

// Initialize worker service (no parameter needed in worker context)
const service = new WorkerThreadService();

console.log('[Worker] Worker thread initialized');

// Export service for potential external usage
export { service };
