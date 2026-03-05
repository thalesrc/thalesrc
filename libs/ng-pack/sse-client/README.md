# @telperion/ng-pack/sse-client

Angular service for Server-Sent Events (SSE) with RxJS Observables and HttpClient-inspired interceptors.

## Features

- 🚀 **Observable-based API** - Seamlessly integrate with RxJS ecosystem
- 🔗 **HttpClient-inspired interceptors** - Familiar pattern for request/response manipulation
- 🎯 **Type-safe** - Full TypeScript support with generic typing
- ⚡ **EventSource wrapper** - Clean abstraction over native EventSource API
- 🔄 **Reactive streaming** - Real-time data updates with automatic cleanup
- 🎨 **Feature-based configuration** - Extensible architecture following modern Angular patterns
- 🧹 **Automatic cleanup** - Proper resource management on unsubscribe

## Installation

This is a secondary entry point of `@telperion/ng-pack`. Import from `@telperion/ng-pack/sse-client`.

```bash
npm install @telperion/ng-pack
```

## Setup

Configure the SSE client in your application config:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideSseClient } from '@telperion/ng-pack/sse-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSseClient(),
    // ... other providers
  ]
};
```

## Usage

### Basic Usage

Create a component that connects to an SSE endpoint and displays real-time data:

```typescript
import { Component, inject } from '@angular/core';
import { SseClient } from '@telperion/ng-pack/sse-client';
import { AsyncPipe } from '@angular/common';

interface StockUpdate {
  symbol: string;
  price: number;
  change: number;
}

@Component({
  selector: 'app-stock-ticker',
  template: `
    <div class="stock-ticker">
      <h2>Live Stock Prices</h2>
      @if (stockUpdates$ | async; as update) {
        <div class="stock-card">
          <span class="symbol">{{ update.symbol }}</span>
          <span class="price">\${{ update.price }}</span>
          <span [class.positive]="update.change > 0" [class.negative]="update.change < 0">
            {{ update.change > 0 ? '+' : '' }}{{ update.change }}%
          </span>
        </div>
      }
    </div>
  `,
  standalone: true,
  imports: [AsyncPipe]
})
export class StockTickerComponent {
  private sseClient = inject(SseClient);

  // Start SSE connection and get Observable stream
  stockUpdates$ = this.sseClient.start<StockUpdate>('/api/stocks/stream');
}
```

### Using Interceptors

Interceptors allow you to modify requests, add logging, handle authentication, or implement retry logic. They work just like Angular's HttpClient interceptors.

#### Logging Interceptor

```typescript
import { SseInterceptorFn } from '@telperion/ng-pack/sse-client';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: SseInterceptorFn<any> = (req, next) => {
  console.log('[SSE] Connecting to:', req.url);
  
  return next(req).pipe(
    tap({
      next: data => console.log('[SSE] Received:', data),
      error: err => console.error('[SSE] Error:', err),
      complete: () => console.log('[SSE] Connection closed')
    })
  );
};
```

#### Authentication Interceptor

```typescript
import { SseInterceptorFn } from '@telperion/ng-pack/sse-client';

export const authInterceptor: SseInterceptorFn<any> = (req, next) => {
  // Add authentication token to URL or modify request
  const token = localStorage.getItem('auth_token');
  const authenticatedUrl = `${req.url}?token=${token}`;
  
  return next({
    ...req,
    url: authenticatedUrl
  });
};
```

#### Retry Interceptor

```typescript
import { SseInterceptorFn } from '@telperion/ng-pack/sse-client';
import { retry, timer } from 'rxjs';

export const retryInterceptor: SseInterceptorFn<any> = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        console.log(`[SSE] Retry attempt ${retryCount} after error:`, error);
        return timer(1000 * retryCount); // Exponential backoff
      }
    })
  );
};
```

#### Configuring Interceptors

Provide interceptors using the `withSseInterceptors()` feature function:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideSseClient, withSseInterceptors } from '@telperion/ng-pack/sse-client';
import { loggingInterceptor, authInterceptor, retryInterceptor } from './interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSseClient(
      withSseInterceptors(
        loggingInterceptor,
        authInterceptor,
        retryInterceptor
      )
    )
  ]
};
```

**Interceptor execution order:** Interceptors are executed in the order they are provided. In the example above, the chain is: logging → auth → retry → EventSource connection.

### Advanced Usage

#### Real-time Notifications

```typescript
import { Component, inject } from '@angular/core';
import { SseClient } from '@telperion/ng-pack/sse-client';
import { AsyncPipe } from '@angular/common';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: number;
}

@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications">
      @for (notification of notifications$ | async; track notification.id) {
        <div [class]="'notification ' + notification.type">
          <span class="message">{{ notification.message }}</span>
          <span class="time">{{ notification.timestamp | date:'short' }}</span>
        </div>
      }
    </div>
  `,
  standalone: true,
  imports: [AsyncPipe]
})
export class NotificationsComponent {
  private sseClient = inject(SseClient);
  
  notifications$ = this.sseClient.start<Notification>('/api/notifications/stream');
}
```

#### Managing Subscriptions

Always unsubscribe from SSE connections when they're no longer needed:

```typescript
import { Component, inject, OnDestroy } from '@angular/core';
import { SseClient } from '@telperion/ng-pack/sse-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  template: `
    <div>
      <h2>Dashboard</h2>
      <p>Active users: {{ activeUsers }}</p>
    </div>
  `
})
export class DashboardComponent implements OnDestroy {
  private sseClient = inject(SseClient);
  private subscription?: Subscription;
  
  activeUsers = 0;

  ngOnInit() {
    // Subscribe manually for more control
    this.subscription = this.sseClient
      .start<{ count: number }>('/api/dashboard/active-users')
      .subscribe({
        next: data => this.activeUsers = data.count,
        error: err => console.error('SSE error:', err)
      });
  }

  ngOnDestroy() {
    // Clean up subscription and close EventSource
    this.subscription?.unsubscribe();
  }
}
```

**Best practice:** Use the `AsyncPipe` when possible to automatically handle subscription management.

#### Error Handling

```typescript
import { Component, inject } from '@angular/core';
import { SseClient } from '@telperion/ng-pack/sse-client';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-feed',
  template: `
    <div>
      @if (error) {
        <div class="error">{{ error }}</div>
      } @else {
        <div>{{ data$ | async }}</div>
      }
    </div>
  `
})
export class FeedComponent {
  private sseClient = inject(SseClient);
  error?: string;

  data$ = this.sseClient.start('/api/feed').pipe(
    catchError(err => {
      this.error = 'Failed to connect to live feed';
      console.error('SSE connection error:', err);
      return of(null);
    })
  );
}
```

#### Custom EventSource Configuration

Pass EventSource initialization options to configure credentials, CORS, etc.:

```typescript
@Component({
  selector: 'app-secure-feed',
  template: `<div>{{ data$ | async }}</div>`
})
export class SecureFeedComponent {
  private sseClient = inject(SseClient);

  data$ = this.sseClient.start('/api/secure/feed', {
    withCredentials: true // Send cookies with the request
  });
}
```

## API Reference

### `provideSseClient(...features: SseFeature[][]): Provider[]`

Provides the SSE client service with optional feature configurations.

**Parameters:**
- `features` (optional) - Feature configurations such as `withSseInterceptors()`

**Returns:** Array of Angular providers

**Example:**
```typescript
provideSseClient(
  withSseInterceptors(loggingInterceptor, authInterceptor)
)
```

---

### `SseClient`

Injectable service for managing SSE connections.

#### `start<T>(url: string, init?: EventSourceInit): Observable<T>`

Starts a new Server-Sent Events connection and returns an Observable stream.

**Parameters:**
- `url` - The endpoint URL for the SSE connection
- `init` (optional) - EventSource initialization options (e.g., `{ withCredentials: true }`)

**Returns:** Observable stream of typed server-sent events

**Example:**
```typescript
sseClient.start<MessageData>('/api/events', { withCredentials: true })
  .subscribe(data => console.log('Received:', data));
```

---

### `withSseInterceptors(...interceptors: SseInterceptorFn<T>[]): SseFeature[]`

Configures functional interceptors for the SSE client.

**Parameters:**
- `interceptors` - One or more functional interceptor functions

**Returns:** Array of SSE features to be used with `provideSseClient()`

**Example:**
```typescript
withSseInterceptors(
  loggingInterceptor,
  authInterceptor,
  retryInterceptor
)
```

---

### `SseInterceptorFn<T>`

Type definition for functional interceptors.

```typescript
type SseInterceptorFn<T> = (
  request: SseRequest,
  next: SseNextFn<T>
) => Observable<T>;
```

**Parameters:**
- `request` - The SSE request containing `url` and `init`
- `next` - Function to call the next interceptor in the chain

**Returns:** Observable of the intercepted request

---

### `SseRequest`

Interface representing an SSE request.

```typescript
interface SseRequest {
  url: string;
  init: EventSourceInit;
}
```

---

### `SseInterceptor<T>`

Class-based interceptor interface (for advanced use cases).

```typescript
interface SseInterceptor<T = unknown> {
  sseIntercept<U = T>(
    request: SseRequest,
    next: SseNextFn<U>
  ): Observable<U>;
}
```

## Best Practices

### 1. Always Unsubscribe

Use the `AsyncPipe` or manually unsubscribe to prevent memory leaks and close connections:

```typescript
// ✅ Good - using AsyncPipe (automatic cleanup)
data$ = this.sseClient.start('/api/feed');

// ✅ Good - manual subscription with cleanup
ngOnInit() {
  this.subscription = this.sseClient.start('/api/feed').subscribe(...);
}

ngOnDestroy() {
  this.subscription?.unsubscribe();
}

// ❌ Bad - no cleanup
ngOnInit() {
  this.sseClient.start('/api/feed').subscribe(...);
}
```

### 2. Handle Errors Gracefully

Always implement error handling for SSE connections:

```typescript
data$ = this.sseClient.start('/api/feed').pipe(
  catchError(err => {
    console.error('SSE error:', err);
    // Return fallback value or retry
    return of(null);
  })
);
```

### 3. Use Type Safety

Leverage TypeScript generics for type-safe event data:

```typescript
// ✅ Good - typed
interface StockUpdate {
  symbol: string;
  price: number;
}
data$ = this.sseClient.start<StockUpdate>('/api/stocks');

// ❌ Bad - untyped
data$ = this.sseClient.start('/api/stocks');
```

### 4. Interceptor Order Matters

Place interceptors in logical order. Generally: logging → authentication → error handling → retry:

```typescript
provideSseClient(
  withSseInterceptors(
    loggingInterceptor,    // First: log everything
    authInterceptor,       // Second: add auth
    errorHandlerInterceptor, // Third: handle errors
    retryInterceptor       // Last: retry failed connections
  )
)
```

### 5. Consider Reconnection Strategies

For production applications, implement retry logic with exponential backoff:

```typescript
const retryInterceptor: SseInterceptorFn<any> = (req, next) => {
  return next(req).pipe(
    retry({
      count: 5,
      delay: (error, retryCount) => timer(Math.min(1000 * Math.pow(2, retryCount), 30000))
    })
  );
};
```

### 6. Use Environment-Specific Configuration

Configure different interceptors for development and production:

```typescript
// app.config.ts
const interceptors = environment.production
  ? [authInterceptor, retryInterceptor]
  : [loggingInterceptor, authInterceptor, retryInterceptor];

export const appConfig: ApplicationConfig = {
  providers: [
    provideSseClient(withSseInterceptors(...interceptors))
  ]
};
```

## Common Use Cases

### Real-time Chat

```typescript
interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: number;
}

messages$ = this.sseClient.start<ChatMessage>('/api/chat/stream');
```

### Live Dashboard Metrics

```typescript
interface Metrics {
  cpu: number;
  memory: number;
  activeUsers: number;
}

metrics$ = this.sseClient.start<Metrics>('/api/dashboard/metrics');
```

### Stock Price Updates

```typescript
interface StockPrice {
  symbol: string;
  price: number;
  volume: number;
}

stocks$ = this.sseClient.start<StockPrice>('/api/stocks/live');
```

### Server Logs Streaming

```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

logs$ = this.sseClient.start<LogEntry>('/api/logs/stream');
```

## Comparison with HttpClient

The SSE client deliberately mirrors Angular's HttpClient pattern:

| Feature | HttpClient | SseClient |
|---------|------------|-----------|
| **Return Type** | `Observable` | `Observable` |
| **Interceptors** | `HttpInterceptor` | `SseInterceptor` |
| **Provider** | `provideHttpClient()` | `provideSseClient()` |
| **Features** | `withInterceptors()` | `withSseInterceptors()` |
| **Connection** | Request/Response | Persistent stream |
| **Use Case** | REST APIs | Real-time updates |

This familiar pattern makes it easy for Angular developers to adopt SSE for real-time features.

## License

This library is part of the Telperion monorepo.
