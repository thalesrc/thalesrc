# @telperion/ng-pack/utils

Angular utility functions and plugins for enhanced development experience

## Motivation

Provide reusable utilities and plugins for Angular applications to reduce boilerplate and enhance developer productivity.

## Goals

* TypeScript support
* Tree-shaking
* Minimal dependencies
* Type-safe
* Well documented
* High test coverage

## Installation

```bash
npm install @telperion/ng-pack
# or
yarn add @telperion/ng-pack
# or
pnpm add @telperion/ng-pack
```

## Features

### Event Modifiers Plugin

Angular Event Manager Plugin that enables event modifier syntax in templates, similar to Vue.js.

#### Usage

First, provide the plugin in your application:

```typescript
import { provideEventModifiersPlugin } from '@telperion/ng-pack/utils';

bootstrapApplication(AppComponent, {
  providers: [provideEventModifiersPlugin()]
});
```

Then use modifiers in your templates:

```html
<!-- Prevent default form submission -->
<form (submit.pd)="onSubmit()">...</form>

<!-- Stop event propagation -->
<div (click.sp)="handleClick()">...</div>

<!-- Chain multiple modifiers -->
<button (click.pd.sp)="handleButtonClick()">Click me</button>
```

#### Available Modifiers

- `pd` - Calls `preventDefault()` on the event
- `sp` - Calls `stopPropagation()` on the event

### Provide Service Directive

Utility function to create a provider for a directive/component that can be injected as a service. Useful for parent-child directive communication.

#### Usage

**1. Create an injection token:**

```typescript
// parent.service.ts
import { InjectionToken } from "@angular/core";
import type { ParentDirective } from "./parent.directive";

export const ParentService = new InjectionToken<ParentDirective>("ParentService");
```

**2. Provide the directive as a service:**

```typescript
// parent.directive.ts
import { Directive } from "@angular/core";
import { provideServiceDirective } from "@telperion/ng-pack/utils";
import { ParentService } from "./parent.service";

@Directive({
  selector: '[parent]',
  providers: [provideServiceDirective(ParentService, ParentDirective)],
})
export class ParentDirective {
  doSomething() {
    console.log('Parent action');
  }
}
```

**3. Inject in child directive:**

```typescript
// child.directive.ts
import { Directive, inject } from "@angular/core";
import { ParentService } from "./parent.service";

@Directive({
  selector: '[child]',
})
export class ChildDirective {
  private parent = inject(ParentService);

  ngOnInit() {
    this.parent.doSomething();
  }
}
```

**4. Use in template:**

```html
<div parent>
  <div child></div>
</div>
```

### Construct Fetcher

A utility function that creates a proxy wrapper around Angular's `HttpClient` to convert Observable-based HTTP methods into Promise-based methods with automatic error handling. Returns a tuple of `[error, response]` instead of throwing, following the Go-style error handling pattern.

#### Features

- 🎯 Converts all HttpClient methods to Promise-based API
- ✅ Returns `[error, response]` tuple for predictable error handling
- 🔄 Automatically uses `firstValueFrom` to convert Observables
- 🛡️ No try-catch blocks needed in your code
- 💉 Uses Angular's dependency injection

#### Usage

**Basic example:**

```typescript
import { Component } from '@angular/core';
import { constructFetcher } from '@telperion/ng-pack/utils';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="fetchData()">Fetch Data</button>
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error">Error: {{ error }}</div>
    <div *ngIf="data">{{ data | json }}</div>
  `
})
export class ExampleComponent {
  private fetcher = constructFetcher();
  
  loading = false;
  error: any = null;
  data: any = null;

  async fetchData() {
    this.loading = true;
    const [error, response] = await this.fetcher.get<{ items: string[] }>('/api/data');
    this.loading = false;
    
    if (error) {
      this.error = error;
      console.error('Error fetching data:', error);
      return;
    }
    
    this.data = response;
    console.log('Fetched data:', response);
  }
}
```

**POST request with body:**

```typescript
async createUser() {
  const [error, response] = await this.fetcher.post<User>(
    '/api/users',
    { name: 'John', email: 'john@example.com' }
  );
  
  if (error) {
    console.error('Failed to create user:', error);
    return;
  }
  
  console.log('User created:', response);
}
```

**With request options:**

```typescript
async fetchWithHeaders() {
  const [error, response] = await this.fetcher.get<Data>(
    '/api/data',
    {
      headers: { 'Authorization': 'Bearer token' },
      params: { page: '1', limit: '10' }
    }
  );
  
  if (error) {
    // Handle error
    return;
  }
  
  // Use response
}
```

#### API

The fetcher provides the same methods as `HttpClient` but with Promise-based signatures:

- `get<T>(url, options?)` → `Promise<[error, T]>`
- `post<T>(url, body, options?)` → `Promise<[error, T]>`
- `put<T>(url, body, options?)` → `Promise<[error, T]>`
- `patch<T>(url, body, options?)` → `Promise<[error, T]>`
- `delete<T>(url, options?)` → `Promise<[error, T]>`
- `head<T>(url, options?)` → `Promise<[error, T]>`
- `options<T>(url, options?)` → `Promise<[error, T]>`
- `request<T>(method, url, options?)` → `Promise<[error, T]>`

#### Return Value

All methods return a Promise that resolves to a tuple:
- **Success**: `[null, response]` - Error is null, response contains the data
- **Failure**: `[error, null]` - Error contains the error object, response is null

#### Benefits

1. **No try-catch needed**: Error handling is explicit and predictable
2. **Type-safe**: Full TypeScript support with generic types
3. **Consistent pattern**: Same error handling pattern across all HTTP methods
4. **DI integration**: Works seamlessly with Angular's dependency injection
5. **Clean code**: Reduces boilerplate and improves readability

### toSignal

A unified helper that converts a plain value, a Promise, or an Observable into an Angular `Signal`. It normalises the input through `@angular/core/rxjs-interop`'s `toSignal`, so you can use a single call regardless of the source type.

#### Usage

```typescript
import { toSignal } from '@telperion/ng-pack/utils';

// From a plain value
const count = toSignal(42);

// From a Promise
const user = toSignal(fetch('/api/me').then(r => r.json()));

// From an Observable
const messages = toSignal(this.messageService.messages$);

// With options (forwarded to Angular's toSignal)
const data = toSignal(this.dataService.data$, { initialValue: [] });
```

#### API

`toSignal<T>(source: T | Promise<T> | Observable<T>, options?): Signal<T | undefined>`

- `source` - A plain value, Promise, or Observable
- `options` (optional) - Configuration forwarded to Angular's `toSignal` (e.g., `{ initialValue }` )
- Returns a read-only `Signal<T | undefined>`

## License

MIT
