# @telperion/ng-pack/common

Common Angular pipes for working with key-value data structures

## Motivation

Angular templates don't natively support iterating over `Map`, `Set`, or plain object entries. These pipes provide a unified, type-safe way to extract keys, values, or entries from any key-value data structure directly in templates.

## Goals

* TypeScript support with full type inference
* Standalone pipes — no module imports needed
* Unified API across `Map`, `Set`, and plain objects
* Null-safe — returns empty array for `null`/`undefined`
* Tree-shaking

## Installation

```bash
npm install @telperion/ng-pack
# or
yarn add @telperion/ng-pack
# or
pnpm add @telperion/ng-pack
```

## Pipes

### `keys`

Extracts keys from a `Map`, `Set`, or plain object.

| Input Type | Output |
|---|---|
| `Map<K, V>` | `K[]` |
| `Set<T>` | `T[]` |
| `Record<K, V>` | `K[]` |
| `null \| undefined` | `[]` |

#### Usage

```typescript
import { Component } from '@angular/core';
import { KeysPipe } from '@telperion/ng-pack/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [KeysPipe],
  template: `
    @for (key of user | keys; track key) {
      <span>{{ key }}</span>
    }
  `
})
export class ExampleComponent {
  user = { name: 'Alice', role: 'Admin' };
}
```

**With a Map:**

```typescript
settings = new Map<string, boolean>([
  ['darkMode', true],
  ['notifications', false],
]);

// template: settings | keys → ['darkMode', 'notifications']
```

---

### `values`

Extracts values from a `Map`, `Set`, or plain object.

| Input Type | Output |
|---|---|
| `Map<K, V>` | `V[]` |
| `Set<T>` | `T[]` |
| `Record<K, V>` | `V[]` |
| `null \| undefined` | `[]` |

#### Usage

```typescript
import { Component } from '@angular/core';
import { ValuesPipe } from '@telperion/ng-pack/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ValuesPipe],
  template: `
    @for (value of scores | values; track value) {
      <span>{{ value }}</span>
    }
  `
})
export class ExampleComponent {
  scores = new Map<string, number>([
    ['Alice', 95],
    ['Bob', 87],
  ]);
}
```

---

### `entries`

Extracts entries from a `Map`, `Set`, or plain object as `{ key, value }` objects.

| Input Type | Output |
|---|---|
| `Map<K, V>` | `KeyValue<K, V>[]` |
| `Set<T>` | `KeyValue<T, T>[]` |
| `Record<K, V>` | `KeyValue<K, V>[]` |
| `null \| undefined` | `[]` |

The `KeyValue<K, V>` interface is exported for typing:

```typescript
interface KeyValue<K, V> {
  key: K;
  value: V;
}
```

#### Usage

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
  user = { name: 'Alice', role: 'Admin', level: 5 };
}
```

**With a Map:**

```typescript
import { Component } from '@angular/core';
import { EntriesPipe, KeyValue } from '@telperion/ng-pack/common';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [EntriesPipe],
  template: `
    @for (entry of permissions | entries; track entry.key) {
      <label>
        <input type="checkbox" [checked]="entry.value" />
        {{ entry.key }}
      </label>
    }
  `
})
export class PermissionsComponent {
  permissions = new Map<string, boolean>([
    ['read', true],
    ['write', false],
    ['admin', false],
  ]);
}
```

## API Reference

| Export | Type | Description |
|---|---|---|
| `KeysPipe` | Pipe (`keys`) | Extracts keys from Map, Set, or object |
| `ValuesPipe` | Pipe (`values`) | Extracts values from Map, Set, or object |
| `EntriesPipe` | Pipe (`entries`) | Extracts entries as `{ key, value }` objects |
| `KeyValue<K, V>` | Interface | Shape of entries pipe output items |
