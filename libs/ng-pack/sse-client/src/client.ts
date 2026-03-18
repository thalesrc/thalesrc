import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { SSE_INTERCEPTORS, SseRequest } from "./interceptor";

/**
 * Angular service for managing Server-Sent Events (SSE) connections.
 * Wraps the EventSource API with RxJS Observables and an HttpClient-inspired interceptor chain.
 *
 * @example
 * ```typescript
 * class MyComponent {
 *   private sseClient = inject(SseClient);
 *
 *   messages$ = this.sseClient.start<string>('/api/events');
 * }
 * ```
 */
@Injectable()
export class SseClient {
  #interceptors = inject(SSE_INTERCEPTORS, { optional: true }) ?? [];

  constructor() {
    if (!(this.#interceptors instanceof Array)) {
      throw new Error('SSE_INTERCEPTORS must be provided as an array. Please ensure you are using multi: true when providing interceptors.');
    }
  }

  /**
   * Starts a new Server-Sent Events connection and returns an Observable stream.
   *
   * @param url - The URL endpoint for the SSE connection
   * @param init - Optional EventSource initialization configuration
   * @returns Observable stream of server-sent events
   *
   * @example
   * ```typescript
   * this.sseClient.start<MessageData>('/api/notifications', { withCredentials: true })
   *   .subscribe(data => console.log('Received:', data));
   * ```
   */
  start<T = string>(url: string, init: EventSourceInit = {}): Observable<T> {
    return this.#interceptors.reduceRight(
      (next, interceptor) => (req) => interceptor.sseIntercept(req, next),
      (req: SseRequest) => this.#createEventSource<T>(req)
    )({ url, init });
  }

  #createEventSource<T>(request: SseRequest): Observable<T> {
    return new Observable<T>((subscriber) => {
      const eventSource = new EventSource(request.url, request.init);

      function handleMessage(event: MessageEvent) {
        subscriber.next(event.data);
      }

      function handleError(err: Event) {
        subscriber.error(err);
        eventSource.close();
      }

      eventSource.addEventListener('message', handleMessage);
      eventSource.addEventListener('error', handleError);

      return () => {
        eventSource.removeEventListener('message', handleMessage);
        eventSource.removeEventListener('error', handleError);
        eventSource.close();
      };
    });
  }
}
