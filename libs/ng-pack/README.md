# @telperion/ng-pack

[![npm version](https://img.shields.io/npm/v/@telperion/ng-pack.svg)](https://www.npmjs.com/package/@telperion/ng-pack)
[![npm downloads](https://img.shields.io/npm/dm/@telperion/ng-pack.svg)](https://www.npmjs.com/package/@telperion/ng-pack)
[![License](https://img.shields.io/npm/l/@telperion/ng-pack.svg)](https://github.com/telperiontech/telperion/blob/main/libs/ng-pack/LICENSE)

A collection of Angular utilities and libraries

## Installation

```bash
npm install @telperion/ng-pack
```

## Available Modules

### Common

**Import:** `@telperion/ng-pack/common`

Common Angular pipes for working with key-value data structures (`Map`, `Set`, plain objects).

#### Key Features

- 🔑 `keys` pipe — extract keys from any key-value structure
- 📦 `values` pipe — extract values from any key-value structure
- 📋 `entries` pipe — extract entries as `{ key, value }` objects
- 🗺️ Supports `Map`, `Set`, and plain objects
- 🎯 Full type inference with overloaded signatures
- 🛡️ Null-safe — returns `[]` for `null`/`undefined`

#### Quick Start

```typescript
import { Component } from '@angular/core';
import { EntriesPipe } from '@telperion/ng-pack/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [EntriesPipe],
  template: `
    @for (entry of user | entries; track entry.key) {
      <div>{{ entry.key }}: {{ entry.value }}</div>
    }
  `
})
export class ExampleComponent {
  user = { name: 'Alice', role: 'Admin' };
}
```

[Full documentation →](./common/README.md)

---

### Storage Signals

**Import:** `@telperion/ng-pack/storage-signals`

Angular signals-based wrapper for browser's localStorage, sessionStorage, and cookies with reactive updates.

#### Key Features

- 🚀 Signal-based API integrated with Angular's signal system
- 🔄 Reactive updates automatically synced across components
- 🎯 Nested property access using dot notation
- 🏪 Support for localStorage, sessionStorage, and cookies
- 🔑 Namespaced storage organization
- 🍪 Full cookie configuration (secure, sameSite, maxAge, etc.)
- 🔗 Cross-instance synchronization for cookie storage

#### Quick Start

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideLocalStorage } from '@telperion/ng-pack/storage-signals';

export const appConfig: ApplicationConfig = {
  providers: [
    provideLocalStorage('my-app'),
  ]
};
```

```typescript
import { Component } from '@angular/core';
import { localStorageSignal } from '@telperion/ng-pack/storage-signals';

@Component({
  selector: 'app-settings',
  template: `
    <div>
      <p>Theme: {{ theme() }}</p>
      <button (click)="theme.set('dark')">Dark Mode</button>
    </div>
  `
})
export class SettingsComponent {
  // Access nested properties with dot notation
  theme = localStorageSignal<string>('settings', 'ui.theme');
}
```

**Cookie Storage:**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideCookieStorage } from '@telperion/ng-pack/storage-signals';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCookieStorage('my-app', {
      secure: true,
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    }),
  ]
};
```

```typescript
import { Component } from '@angular/core';
import { cookieStorageSignal } from '@telperion/ng-pack/storage-signals';

@Component({
  selector: 'app-auth',
  template: `
    <div>
      @if (authToken()) {
        <button (click)="authToken.delete()">Logout</button>
      } @else {
        <button (click)="authToken.set('token123')">Login</button>
      }
    </div>
  `
})
export class AuthComponent {
  // Cookie with custom expiry
  authToken = cookieStorageSignal<string>('auth', 'token', {
    maxAge: 3600 // 1 hour
  });
}
```

[Full documentation →](./storage-signals/README.md)

---

### SSE Client

**Import:** `@telperion/ng-pack/sse-client`

Angular service for Server-Sent Events (SSE) with RxJS Observables and HttpClient-inspired interceptors.

#### Key Features

- 🚀 Observable-based API integrated with RxJS ecosystem
- 🔗 HttpClient-inspired interceptor chain for request manipulation
- 🎯 Type-safe with full generic support
- ⚡ EventSource wrapper with automatic cleanup
- 🔄 Real-time streaming data updates
- 🎨 Feature-based configuration

#### Quick Start

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideSseClient, withSseInterceptors, withBaseInit } from '@telperion/ng-pack/sse-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSseClient(
      withBaseInit({ withCredentials: true }),
      withSseInterceptors(loggingInterceptor, authInterceptor)
    ),
  ]
};
```

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
    <div>
      <h2>Live Stock Prices</h2>
      @if (stockUpdates$ | async; as update) {
        <div class="stock-card">
          <span>{{ update.symbol }}: \${{ update.price }}</span>
          <span [class.positive]="update.change > 0">
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

[Full documentation →](./sse-client/README.md)

---

### Template Signal Forms

**Import:** `@telperion/ng-pack/template-signal-forms`

🚧 **Under Construction**

Signal-based forms utilities for Angular template-driven forms.

---

### Utils

**Import:** `@telperion/ng-pack/utils`

Angular utility functions and plugins for enhanced development experience.

#### Key Features

- 🎯 Event modifier syntax for templates (`.pd`, `.sp`)
- 🔗 Directive-as-service provider utility
- 🌐 Promise-based HTTP client with tuple error handling
- � Unified `toSignal` — convert values, Promises, or Observables to Signals
- �📦 Tree-shakeable and type-safe
- ⚡ Zero dependencies

#### Quick Start

**Event Modifiers Plugin**

```typescript
import { provideEventModifiersPlugin } from '@telperion/ng-pack/utils';

bootstrapApplication(AppComponent, {
  providers: [provideEventModifiersPlugin()]
});
```

```html
<!-- Prevent default and stop propagation with modifiers -->
<form (submit.pd)="onSubmit()">...</form>
<div (click.sp)="handleClick()">...</div>
<button (click.pd.sp)="handleButtonClick()">Click me</button>
```

**Construct Fetcher**

```typescript
import { Component } from '@angular/core';
import { constructFetcher } from '@telperion/ng-pack/utils';

@Component({
  selector: 'app-example',
  template: `<button (click)="fetchData()">Fetch Data</button>`
})
export class ExampleComponent {
  private fetcher = constructFetcher();

  async fetchData() {
    const [error, response] = await this.fetcher.get('/api/data');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Data:', response);
  }
}
```

**Provide Service Directive**

```typescript
import { provideServiceDirective } from '@telperion/ng-pack/utils';

// Create an injection token
export const ParentService = new InjectionToken<ParentDirective>("ParentService");

// Provide directive as service
@Directive({
  selector: '[parent]',
  providers: [provideServiceDirective(ParentService, ParentDirective)],
})
export class ParentDirective { }

// Inject in child
@Directive({ selector: '[child]' })
export class ChildDirective {
  private parent = inject(ParentService);
}
```

[Full documentation →](./utils/README.md)

---

## Development

### Running Unit Tests

Run `pnpm nx test ng-pack` to execute the unit tests.

### Building

Run `pnpm nx build ng-pack` to build the library.

## License

This library is part of the Telperion monorepo.
