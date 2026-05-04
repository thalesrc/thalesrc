# @telperion/dom-utils

[![npm](https://img.shields.io/npm/v/@telperion/dom-utils.svg)](https://www.npmjs.com/package/@telperion/dom-utils)
[![npm](https://img.shields.io/npm/dm/@telperion/dom-utils.svg)](https://www.npmjs.com/package/@telperion/dom-utils)
[![codecov](https://codecov.io/gh/telperiontech/telperion/graph/badge.svg?token=dz46LY3onk&flag=dom-utils)](https://app.codecov.io/gh/telperiontech/telperion/tree/main?flags%5B0%5D=dom-utils)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Lightweight DOM utility helpers for the modern web — tree-shakable, dependency-free, fully typed.

**Part of the [Telperion](https://github.com/telperiontech/telperion) monorepo**

## Installation

```bash
npm install @telperion/dom-utils
# or
yarn add @telperion/dom-utils
# or
pnpm add @telperion/dom-utils
```

## Features

- 🌳 **`getParents`** — Lazily walk up the parent chain of any element
- 🪞 **`DomClone`** — Deep-clone an element and keep the clone in sync with subsequent mutations (attributes, child nodes, text, inline styles)
- 📦 Tree-shakable per-file deep imports (`@telperion/dom-utils/get-parents`, `@telperion/dom-utils/dom-clone`)
- 0️⃣ Zero runtime dependencies (other than `tslib`)

## API

### `getParents`

Lazily yields each ancestor of the given element walking up the parent chain. Stops when there is no further `parentElement`.

```typescript
import { getParents } from '@telperion/dom-utils/get-parents';

const node = document.querySelector('.deep-child')!;

for (const parent of getParents(node)) {
  console.log(parent.tagName);
}
```

**Signature**

```typescript
function getParents<T extends HTMLElement = HTMLElement>(node: T): Generator<T>;
```

**Parameters**
- `node` — The element to start walking from.

**Returns**
- A `Generator<T>` that yields each ancestor element from closest to furthest.

---

### `DomClone`

Deep-clones a target element and keeps the clone live: any subsequent mutation on the original — attribute changes (including inline `style`), text / character-data updates, and child node insertions/removals across the whole subtree — is mirrored onto the clone via a single `MutationObserver`.

Sync is one-way (target → clone). Mutations on the clone are not reflected back.

```typescript
import { DomClone } from '@telperion/dom-utils/dom-clone';

const target = document.querySelector('#source')!;
const mirror = new DomClone(target);

document.body.appendChild(mirror.clone);

// Any mutation on `target` from now on is reflected on `mirror.clone`:
target.setAttribute('data-state', 'active');
target.style.color = 'tomato';
target.append(document.createElement('span'));

// When you are done:
mirror.disconnect();
```

**Constructor**

```typescript
new DomClone<T extends Element = Element>(target: T, options?: DomCloneOptions);
```

**Options**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `attributes` | `boolean` | `true` | Mirror attribute additions/changes/removals (covers inline `style`). |
| `childList` | `boolean` | `true` | Mirror child node insertions and removals across the subtree. |
| `characterData` | `boolean` | `true` | Mirror text / character-data changes across the subtree. |

**Members**
- `readonly clone: T` — The deep-cloned, live-synced element. Append it anywhere in the document.
- `disconnect(): void` — Stops mirroring further mutations. Safe to call multiple times.

## Building

Run `pnpm nx run dom-utils:build` to build the library.

## Running unit tests

Run `pnpm nx run dom-utils:test` to execute the unit tests via [Vitest](https://vitest.dev/).

## License

[MIT](./LICENSE)
