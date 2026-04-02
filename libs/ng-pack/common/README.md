# @telperion/ng-pack/common

Common Angular pipes and directives for template iteration, key-value data structures, and element observation

## Motivation

Angular templates don't natively support iterating over `Map`, `Set`, or plain object entries, nor do they have a built-in way to repeat a block a specific number of times. Additionally, observing element size changes requires verbose `ResizeObserver` boilerplate. This module provides standalone, tree-shakeable pipes and directives that fill these gaps with a unified, type-safe API.

## Goals

* TypeScript support with full type inference
* Standalone pipes and directives — no module imports needed
* Unified API across `Map`, `Set`, and plain objects
* Null-safe — returns empty array for `null`/`undefined`
* Signal-based reactive APIs for directives
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

---

### `times`

Generates an array of sequential integers `[0, 1, ..., n-1]` from a given number, useful for repeating template blocks.

| Input Type | Output |
|---|---|
| `number` | `number[]` (`[0, 1, ..., n-1]`) |
| Negative / `NaN` | `[]` |
| `null \| undefined` | `[]` |

#### Usage

```typescript
import { Component } from '@angular/core';
import { TimesPipe } from '@telperion/ng-pack/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TimesPipe],
  template: `
    @for (i of 5 | times; track i) {
      <span>⭐</span>
    }
  `
})
export class ExampleComponent {}
```

**Dynamic count:**

```typescript
import { Component } from '@angular/core';
import { TimesPipe } from '@telperion/ng-pack/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [TimesPipe],
  template: `
    @for (i of rating | times; track i) {
      <app-star [filled]="true" />
    }
    @for (i of (maxRating - rating) | times; track i) {
      <app-star [filled]="false" />
    }
  `
})
export class RatingComponent {
  rating = 3;
  maxRating = 5;
}
```

## Directives

### `tngObserveSize`

Observes the size of its host element using `ResizeObserver` and exposes dimensions as Angular signals and outputs. Uses `borderBoxSize` and reports in logical (inline/block) axes, making it writing-mode aware.

#### Signals (via `exportAs`)

| Signal | Type | Description |
|---|---|---|
| `inlineSize()` | `Signal<number>` | Current inline size (width in horizontal writing modes) |
| `blockSize()` | `Signal<number>` | Current block size (height in horizontal writing modes) |
| `size()` | `Signal<{ inline: number; block: number }>` | Combined dimensions |

#### Outputs

| Output | Type | Description |
|---|---|---|
| `tngObserveSize` | `{ inline: number; block: number }` | Emits both dimensions on any size change |
| `inlineChange` | `number` | Emits the new inline size |
| `blockChange` | `number` | Emits the new block size |

#### Usage

**As an event emitter:**

```html
<div (tngObserveSize)="onResize($event)">
  Responsive content
</div>
```

**As a template reference (signal access):**

```typescript
import { Component } from '@angular/core';
import { ObserveSizeDirective } from '@telperion/ng-pack/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ObserveSizeDirective],
  template: `
    <div tngObserveSize #sizeRef="tngObserveSize">
      Inline: {{ sizeRef.inlineSize() }}px,
      Block: {{ sizeRef.blockSize() }}px
    </div>
  `
})
export class ExampleComponent {}
```

**Individual axis change events:**

```html
<div tngObserveSize
     (inlineChange)="onWidthChange($event)"
     (blockChange)="onHeightChange($event)">
  Responsive content
</div>
```

## API Reference

| Export | Type | Description |
|---|---|---|
| `KeysPipe` | Pipe (`keys`) | Extracts keys from Map, Set, or object |
| `ValuesPipe` | Pipe (`values`) | Extracts values from Map, Set, or object |
| `EntriesPipe` | Pipe (`entries`) | Extracts entries as `{ key, value }` objects |
| `TimesPipe` | Pipe (`times`) | Generates `[0, 1, ..., n-1]` array from a number |
| `ObserveSizeDirective` | Directive (`tngObserveSize`) | Observes element size via `ResizeObserver` with signal-based API |
| `KeyValue<K, V>` | Interface | Shape of entries pipe output items |
