# @telperion/ng-pack/fetcher-signal

Reactive, signal-based HTTP fetcher for Angular built on top of `HttpClient` and Angular signals.

## Features

- 🚦 **Signal-first API** — the result is a `Signal<T>` you can read directly in templates
- 🔁 **Reactive options** — pass `Signal`, `Observable`, `Promise`, or plain values for any option; the request re-runs automatically when they change
- 🛣️ **Path parameters** — declarative `:name` placeholders filled from the `params` option (URL-encoded)
- 🔍 **Query parameters** — accept a plain object or `HttpParams`
- ⚠️ **Built-in `error` and `loading` signals** — first-class request state, no manual bookkeeping
- 🧯 **Fallback value** — used as the initial signal value and as the emitted value on request error
- 🔄 **Manual `reload()`** — re-trigger the current request without changing options; returns a `Promise` that resolves once the new response is in
- ⏳ **`loaded` promise** — `await` the next successful (or fallback-on-error) emission without subscribing to signals
- 🧩 **Works inside or outside an injection context** — pass an `Injector` when needed
- 🎯 **Fully typed generics** — `Result`, `Body`, `Params`, and `QueryParams`

## Installation

This is a secondary entry point of `@telperion/ng-pack`. Import from `@telperion/ng-pack/fetcher-signal`.

```bash
npm install @telperion/ng-pack
```

## Setup

`fetcherSignal()` uses Angular's `HttpClient` under the hood, so make sure `provideHttpClient()` is registered in your application config:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... other providers
  ]
};
```

## Usage

### Quick Start

Read a remote resource as a signal:

```typescript
import { Component } from '@angular/core';
import { fetcherSignal } from '@telperion/ng-pack/fetcher-signal';

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  template: `
    @if (users.loading()) {
      <p>Loading…</p>
    } @else if (users.error()) {
      <p>Failed to load users.</p>
    } @else {
      <ul>
        @for (user of users(); track user.id) {
          <li>{{ user.name }}</li>
        }
      </ul>
    }
  `
})
export class UsersComponent {
  users = fetcherSignal<User[]>({
    url: '/api/users',
    fallback: []
  });
}
```

### Reactive Options

Any option can be a `Signal`, `Observable`, or `Promise`. When its value changes, the request automatically re-runs (debounced by 10ms so multiple option changes batch into a single fetch).

```typescript
import { Component, computed, signal } from '@angular/core';
import { fetcherSignal } from '@telperion/ng-pack/fetcher-signal';

@Component({
  selector: 'app-search',
  standalone: true,
  template: `
    <input [value]="query()" (input)="query.set($any($event.target).value)" />

    @if (results.loading()) { <p>Searching…</p> }

    <ul>
      @for (item of results(); track item.id) {
        <li>{{ item.title }}</li>
      }
    </ul>
  `
})
export class SearchComponent {
  query = signal('');

  results = fetcherSignal<{ id: number; title: string }[]>({
    url: '/api/search',
    queryParams: computed(() => ({ q: this.query() })),
    fallback: []
  });
}
```

### Path Parameters

Use `:name` placeholders in the URL and provide their values via the `params` option. Values are URL-encoded automatically; missing keys throw.

```typescript
import { Component, input } from '@angular/core';
import { fetcherSignal } from '@telperion/ng-pack/fetcher-signal';

interface User { id: number; name: string; email: string; }

@Component({
  selector: 'app-user-detail',
  standalone: true,
  template: `
    @if (user(); as u) {
      <h2>{{ u.name }}</h2>
      <p>{{ u.email }}</p>
    }
  `
})
export class UserDetailComponent {
  userId = input.required<string>();

  user = fetcherSignal<User>({
    url: '/api/users/:id',
    params: computed(() => ({ id: this.userId() }))
  });
}
```

### Query Parameters

`queryParams` accepts a plain `Record<string, string>` or an `HttpParams` instance:

```typescript
import { HttpParams } from '@angular/common/http';

const list = fetcherSignal<Item[]>({
  url: '/api/items',
  queryParams: new HttpParams().set('page', '1').set('size', '20'),
  fallback: []
});
```

### POST / PUT / DELETE

Set `method` and `body`. Both can be reactive:

```typescript
import { Component, signal } from '@angular/core';
import { fetcherSignal } from '@telperion/ng-pack/fetcher-signal';

@Component({
  selector: 'app-create-user',
  standalone: true,
  template: `
    <button (click)="payload.set({ name: 'Alice' })">Create user</button>

    @if (created(); as user) {
      <p>Created user #{{ user.id }}</p>
    }
  `
})
export class CreateUserComponent {
  payload = signal<{ name: string } | null>(null);

  created = fetcherSignal<{ id: number; name: string }, { name: string } | null>({
    url: '/api/users',
    method: 'post',
    body: this.payload
  });
}
```

### Error Handling and Fallback

`fallback` doubles as the initial value of the signal and the value emitted on request error. The `error` signal exposes the underlying error and is reset to `null` on each successful response.

```typescript
const profile = fetcherSignal<Profile>({
  url: '/api/profile',
  fallback: { id: 0, name: 'Guest' } as Profile
});

effect(() => {
  if (profile.error()) {
    console.error('Profile fetch failed:', profile.error());
  }
});
```

### Manual Reload

Call `reload()` to re-run the current request without changing any option. It returns a `Promise<void>` that resolves when the next response (or the fallback value, on error) has been emitted into the signal — equivalent to awaiting [`loaded`](#awaiting-the-next-response) right after triggering the reload.

```typescript
@Component({
  selector: 'app-stats',
  standalone: true,
  template: `
    <button (click)="refresh()" [disabled]="stats.loading()">
      Refresh
    </button>

    <pre>{{ stats() | json }}</pre>
  `
})
export class StatsComponent {
  stats = fetcherSignal<Stats>({
    url: '/api/stats',
    fallback: {} as Stats
  });

  async refresh() {
    await this.stats.reload();
    console.log('latest stats:', this.stats());
  }
}
```

### Awaiting the Next Response

`loaded` is a getter that returns a fresh `Promise<void>` resolving the next time `loading` flips back to `false` — that is, after the next successful response or after the fallback is emitted on error. It is useful in tests, route resolvers, effects, and anywhere you need to `await` the fetcher without subscribing to the signal.

```typescript
const users = fetcherSignal<User[]>({ url: '/api/users', fallback: [] });

await users.loaded;       // wait for the initial response
console.log(users());     // populated value

// later, after an option changes or reload() is called:
await users.loaded;       // wait for the next response
```

Because `loaded` is a getter, each access returns a new promise that tracks the *next* settle of the request — never a cached one.

### Use Outside an Injection Context

When calling `fetcherSignal()` outside of an injection context (e.g. in a plain class or factory), pass an `Injector` as the second argument:

```typescript
import { Injector } from '@angular/core';
import { fetcherSignal } from '@telperion/ng-pack/fetcher-signal';

export function createUserFetcher(injector: Injector, userId: string) {
  return fetcherSignal<User>(
    {
      url: '/api/users/:id',
      params: { id: userId }
    },
    injector
  );
}
```

## API Reference

### `fetcherSignal<Result, Body, Params, QueryParams>(options, injector?): FetcherSignal<Result>`

Creates a reactive HTTP fetcher exposed as a `Signal`.

**Type parameters:**

| Parameter     | Default | Description                          |
| ------------- | ------- | ------------------------------------ |
| `Result`      | `any`   | Type of the response body            |
| `Body`        | `null`  | Type of the request body             |
| `Params`      | `{}`    | Shape of the URL path parameter map  |
| `QueryParams` | `{}`    | Shape of the query parameter object  |

**Parameters:**

- `options` — see [`FetcherSignalOptions`](#fetchersignaloptions) below
- `injector` *(optional)* — Angular `Injector` to use when called outside an injection context

**Returns:** A [`FetcherSignal<Result>`](#fetchersignalresult).

---

### `FetcherSignalOptions`

Each field accepts a plain value, `Signal`, `Promise`, or `Observable` of that value. Reactive option changes trigger a re-fetch (debounced by 10ms).

| Option        | Type                                                       | Default | Description                                                                   |
| ------------- | ---------------------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `url`         | `string`                                                   | `''`    | Endpoint URL. Supports `:name` placeholders filled from `params`.             |
| `method`      | `'get' \| 'post' \| 'put' \| 'delete' \| 'patch' \| ...`   | `'get'` | HTTP method (any string accepted by `HttpClient.request`).                    |
| `headers`     | `Record<string, string>`                                   | `{}`    | Request headers.                                                              |
| `body`        | `Body`                                                     | `null`  | Request body for non-`get` methods.                                           |
| `queryParams` | `Record<string, string> \| HttpParams`                     | `{}`    | Query string parameters.                                                      |
| `params`      | `Record<string, string>`                                   | `{}`    | Values for `:name` placeholders in `url`. Missing keys throw at request time. |
| `fallback`    | `Result`                                                   | `null`  | Initial signal value AND the value emitted when the request errors.           |

---

### `FetcherSignal<Result>`

A `Signal<Result>` extended with request state and a manual reload trigger.

| Member     | Type                    | Description                                                                                                                       |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| *(call)*   | `() => Result`          | Reads the latest result (or `fallback` before the first response).                                                                |
| `error`    | `Signal<Error \| null>` | Latest request error; reset to `null` on each successful response.                                                                |
| `loading`  | `Signal<boolean>`       | `true` while a request is in flight, `false` once a value is emitted.                                                             |
| `reload()` | `() => Promise<void>`   | Re-runs the current request without changing options. The returned promise resolves once the next value is emitted (see `loaded`). |
| `loaded`   | `Promise<void>` *(getter)* | A fresh promise that resolves the next time `loading` flips back to `false` (after a successful response or fallback-on-error). |

## Notes

- **Debounced option changes** — option updates are batched with a 10ms `debounceTime`. Multiple synchronous signal updates produce a single request.
- **Fallback emission on error** — when a request fails, the `fallback` value is emitted as the next signal value (in addition to populating `error`). Omit `fallback` and read `error` explicitly if you do not want this behavior.
- **Path parameter encoding** — values are passed through `encodeURIComponent`. Missing keys throw `Missing parameter '<key>' for URL '<url>'`.

## License

This library is part of the Telperion monorepo.
