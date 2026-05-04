# Telperion Technology Open Source Libraries

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/telperiontech/telperion?style=social)](https://github.com/telperiontech/telperion)
[![Twitter Follow](https://img.shields.io/twitter/follow/telperion?style=social)](https://twitter.com/telperion)

**A collection of high-quality, framework-independent utilities and tools for modern web development.**

[Website](https://telperion.tr) • [Documentation](https://open-source.telperion.tr) • [npm](https://www.npmjs.com/org/telperion) • [GitHub](https://github.com/telperiontech)

</div>

---

## 📦 Overview

Telperion is a comprehensive monorepo containing battle-tested libraries, utilities, and tools designed to simplify modern web development. From JavaScript utilities to Docker-based infrastructure tools, each package is crafted with performance, type safety, and developer experience in mind.

## 🎯 Key Features

- 🚀 **High Performance**: Optimized for speed and efficiency
- 📘 **TypeScript First**: Full TypeScript support with comprehensive type definitions
- 🌲 **Tree-shakeable**: Import only what you need
- 🔧 **Zero Dependencies**: Most packages have no external dependencies
- 🧪 **Well Tested**: High test coverage across all packages
- 📚 **Extensively Documented**: Comprehensive documentation and examples
- 🎨 **Framework Agnostic**: Works with any framework or vanilla JavaScript

## 📚 Libraries

### JavaScript & TypeScript Utilities

#### [@telperion/js-utils](https://github.com/telperiontech/telperion/tree/main/libs/js-utils)
[![npm](https://img.shields.io/npm/v/@telperion/js-utils.svg)](https://www.npmjs.com/package/@telperion/js-utils)
[![npm](https://img.shields.io/npm/dm/@telperion/js-utils.svg)](https://www.npmjs.com/package/@telperion/js-utils)
[![codecov](https://codecov.io/gh/telperiontech/telperion/graph/badge.svg?token=dz46LY3onk&flag=js-utils)](https://app.codecov.io/gh/telperiontech/telperion/tree/main?flags%5B0%5D=js-utils)

The swiss army knife of JavaScript utilities. A comprehensive collection of 50+ utility functions for arrays, objects, promises, strings, and more. Features include array manipulation, deep cloning, promise chains, debouncing, and smart type guards.

**Highlights**: Array utilities, Promise helpers, Object manipulation, String operations, Function utilities

#### [@telperion/extra-ts-types](https://www.npmjs.com/package/@telperion/extra-ts-types)
[![npm](https://img.shields.io/npm/v/@telperion/extra-ts-types.svg)](https://www.npmjs.com/package/@telperion/extra-ts-types)

Advanced TypeScript utility types for sophisticated type manipulations. Includes types like `PartialSome`, `DeepestValue`, `Join`, `Tail`, and more for working with complex type scenarios.

**Highlights**: Deep object navigation, Tuple manipulation, Constructor types, Partial utilities

#### [@thalesrc/ts-utils](libs/ts-utils)

TypeScript-specific utility types and helper functions built on top of the TypeScript compiler API.

**Highlights**: TypeScript utilities, Compiler helpers

---

### Web & DOM Utilities

#### [@telperion/dom-utils](libs/dom-utils)
[![npm](https://img.shields.io/npm/v/@telperion/dom-utils.svg)](https://www.npmjs.com/package/@telperion/dom-utils)
[![npm](https://img.shields.io/npm/dm/@telperion/dom-utils.svg)](https://www.npmjs.com/package/@telperion/dom-utils)

Utility functions for DOM manipulation and browser APIs. Simplifies common DOM operations with a modern, type-safe API.

**Highlights**: DOM manipulation, Browser API helpers, Event handling

#### [@telperion/elements](https://www.npmjs.com/package/@telperion/elements)
[![npm](https://img.shields.io/npm/v/@telperion/elements.svg)](https://www.npmjs.com/package/@telperion/elements)
[![npm](https://img.shields.io/npm/dm/@telperion/elements.svg)](https://www.npmjs.com/package/@telperion/elements)

Collection of custom web components built with Lit. Features a Material Symbols icon element, a complete client-side routing solution with declarative components for SPAs, a framework-independent drag-and-drop system with extended events, smart drop zones, drag handles, and multiple dragging strategies, a `<details>` grouping element with FIFO open caps, declarative summary markers, and marker-only toggling, a popover element built on the native Popover API and CSS Anchor Positioning with declarative `position` shorthands and automatic edge-flipping (no JS positioning loop), and a form-associated `<tp-select>` selectbox with single/multi-select via `max` (`1`, integer, or `infinite`), FIFO eviction, slotted trigger/panel customization, and a live `<tp-selected-content>` mirror that works across shadow DOM boundaries.

**Sub-modules:**
- **icon**: `<tp-icon>` icon element supporting three families &mdash; Material Symbols (all four variable-font axes: `filled`, `grade`, `weight`, `optical-size`; three variants: outlined/round/sharp), Simple Icons brand icons (`family="simple-icons" slug="facebook"`) loaded on demand from `cdn.simpleicons.org`, and theSVG (`family="thesvg" slug="google" variant="wordmark"`) multi-color brand icons from `thesvg.org`. Each remote family lives in its own shared `<svg>` sprite. Light-DOM rendering and auto-rotating Google Fonts CSS API URLs (self-host friendly)
- **router**: Client-side routing with router, route definitions, outlets, navigation links, and global configuration with support for multiple history strategies and reactive updates
- **drag-drop**: Drag-and-drop web components with extended drag-drop events, smart drop zones, drag handles, and multiple dragging strategies
- **details-set**: `<tp-details-set>` groups native `<details>` elements with a `max-open-items` FIFO cap, declarative `<template summary-marker index="…">` markers cloned into every summary, and a `toggle-on="summary" | "marker"` attribute (per-element overridable) for marker-only disclosure
- **popover**: `<tp-popover>` framework-agnostic popover built on the native Popover API and CSS Anchor Positioning. Auto-applies the `popover` attribute, resolves its anchor from a `target` querySelector (or `parentElement`), and is positioned **entirely in CSS** via `anchor()`. Declarative `position` syntax with shorthands (`center / top`, `start`, `top to bottom`, …) and automatic edge-flipping via `position-try-fallbacks` &mdash; no JS positioning loop. Optional `click` / `hover` triggers
- **select**: `<tp-select>` form-associated selectbox built on `<tp-popover>` with `<tp-option>` items and a live `<tp-selected-content>` mirror. Single-select by default; multi-select via `max` (positive integer with FIFO eviction, or `infinite` for unbounded). Full `<form>` integration via `ElementInternals` (`name`, `disabled`, `required`, validity, reset/restore). Slots for `button` (custom trigger) and `popover` (replace the option list while keeping `<tp-option>`s registered in context). Selection state is signal-backed and propagates across nested shadow DOM boundaries via `@lit/context`

**Highlights**: Material Symbols icons, Variable-font axes, Router components, Client-side routing, URLPattern matching, Signal-based reactivity, Drag & drop, Web Components, Drop zone validation, Details accordion, Summary markers, Popover API, CSS Anchor Positioning, Form-associated selectbox, Multi-select, Cross-framework compatibility

#### [@thalesrc/paintlet](https://www.npmjs.com/package/@thalesrc/paintlet)

Pre-built CSS Paint API (Houdini) worklets for modern web development. Create stunning visual effects like ripples, rain animations, and organic gradients using the CSS Paint API.

**Highlights**: CSS Houdini, Paint worklets, Visual effects, Animated gradients

#### [@telperion/reactive-storage](https://www.npmjs.com/package/@telperion/reactive-storage)
[![npm](https://img.shields.io/npm/v/@telperion/reactive-storage.svg)](https://www.npmjs.com/package/@telperion/reactive-storage)

RxJS-based reactive wrapper for browser storage APIs (localStorage and sessionStorage). Provides an Observable-based API for real-time storage updates with support for nested property access, automatic synchronization, and FIFO-queued write operations. Serves as the foundation for Angular Signal-based and React hooks-based storage utilities.

**Highlights**: Reactive storage, Observable patterns, Nested property access, Type-safe, FIFO operations, Framework foundation

#### [@telperion/rx-utils](libs/rx-utils)
[![npm](https://img.shields.io/npm/v/@telperion/rx-utils.svg)](https://www.npmjs.com/package/@telperion/rx-utils)
[![npm](https://img.shields.io/npm/dm/@telperion/rx-utils.svg)](https://www.npmjs.com/package/@telperion/rx-utils)

Utility functions and operators for RxJS Observables. Features async iterable conversion, share operators, and Observable extensions.

**Highlights**: RxJS operators, AsyncIterable support, Observable utilities, Debounce buffering, Stream helpers

---

### Framework-Specific Utilities

#### [@telperion/ng-pack](libs/ng-pack)
[![npm](https://img.shields.io/npm/v/@telperion/ng-pack.svg)](https://www.npmjs.com/package/@telperion/ng-pack)
[![npm](https://img.shields.io/npm/dm/@telperion/ng-pack.svg)](https://www.npmjs.com/package/@telperion/ng-pack)

Collection of Angular utilities and libraries organized as secondary entry points. Includes signal-based storage management, template-driven form utilities, and common Angular helpers.

**Sub-modules:**
- **common**: Pipes for extracting keys, values, and entries from Maps, Sets, and plain objects, a `times` pipe for repeating template blocks, an `ObserveSizeDirective` for reactive element size observation, and an `*tngUnless` structural directive (inverse of `*ngIf`)
- **storage-signals**: Signal-based localStorage/sessionStorage/cookies with reactive updates, nested property access, and configurable cookie options
- **sse-client**: HttpClient-inspired SSE client with Observable-based streaming, interceptor chain, and reactive real-time updates
- **template-signal-forms**: Signal-based forms for template-driven forms _(under construction)_
- **utils**: Angular utilities including event modifiers, directive-as-service provider, and Promise-based HTTP client with tuple error handling

**Highlights**: Angular signals, Reactive storage, Cookie storage, SSE client, Interceptors, Real-time streaming, Nested property access, Template forms, Event modifiers, HTTP utilities, Type-safe

#### [@thalesrc/react-utils](libs/react-utils)

React-specific utility hooks and components for modern React development. Simplifies common React patterns and state management.

**Highlights**: Custom hooks, React utilities, State management helpers

---

### Messaging & Communication

#### [@telperion/messenger](https://www.npmjs.com/package/@telperion/messenger)
[![npm](https://img.shields.io/npm/v/@telperion/messenger.svg)](https://www.npmjs.com/package/@telperion/messenger)
[![npm](https://img.shields.io/npm/dw/@telperion/messenger.svg)](https://www.npmjs.com/package/@telperion/messenger)
[![codecov](https://codecov.io/gh/telperiontech/telperion/graph/badge.svg?token=dz46LY3onk&flag=messenger)](https://app.codecov.io/gh/telperiontech/telperion/tree/main?flags%5B0%5D=messenger)

Cross-context messaging library for seamless communication across iframes, Chrome extensions, web workers, broadcast channels, and WebRTC data channels. Built with RxJS for reactive message handling with decorators for clean, declarative APIs.

**Sub-modules:**
- **iframe**: Parent-child window messaging with `IframeMessageClient`, `IframeMessageHost`, and `IframeMessageService`
- **chrome**: Chrome extension communication across background scripts, content scripts, and popups
- **worker**: Main thread ↔ Web Worker communication
- **broadcast**: Tab-to-tab messaging via the Broadcast Channel API
- **rtc**: Peer-to-peer messaging over negotiated RTCDataChannels with automatic channel ID derivation

**Highlights**: Iframe messaging, Chrome extension support, Web Workers, Broadcast API, WebRTC DataChannel, RxJS-based, Decorator API

---

### Build & Development Tools

#### [@thalesrc/nx-utils](https://www.npmjs.com/package/@thalesrc/nx-utils)
[![npm](https://img.shields.io/npm/v/@thalesrc/nx-utils.svg)](https://www.npmjs.com/package/@thalesrc/nx-utils)

Powerful Nx executors for monorepo projects. Includes executors for file copying with content replacement and image resizing, package.json generation with auto-exports, parallel command execution, TypeScript building, file watching, platform-specific scripts, and batch operations.

**Highlights**: Copy with transforms, Package.json filling, Parallel execution, TypeScript builder, File watcher, Platform runner

#### [@thalesrc/node-utils](libs/node-utils)

Node.js-specific utility functions for server-side development, file system operations, and CLI tools.

**Highlights**: File system utilities, CLI helpers, Node.js utilities

---

### Infrastructure & DevOps

#### [@thalesrc/auto-proxy](https://github.com/thalesrc/thalesrc/pkgs/container/auto-proxy)
[![GitHub Container Registry](https://img.shields.io/badge/ghcr.io-auto--proxy-blue)](https://github.com/thalesrc/thalesrc/pkgs/container/auto-proxy)

Docker-aware nginx reverse proxy with automatic SSL and service discovery. Perfect for development environments with support for HTTP/HTTPS, gRPC, databases (PostgreSQL, MySQL, Redis, MongoDB), automatic SSL certificates, and Docker container discovery.

**Highlights**: Automatic SSL, gRPC support, Database proxying, Docker integration, Development-optimized

#### [@thalesrc/docker-frp](https://github.com/thalesrc/thalesrc/pkgs/container/docker-frp)
[![GitHub Container Registry](https://img.shields.io/badge/ghcr.io-docker--frp-blue)](https://github.com/thalesrc/thalesrc/pkgs/container/docker-frp)

Comprehensive Docker container for Fast Reverse Proxy (FRP) with both server and client modes. Features web-based admin UI, multiple proxy types (TCP, UDP, HTTP, HTTPS), and easy configuration.

**Highlights**: FRP server/client, Web admin UI, Multi-protocol, Easy setup, Multi-platform support

---

## 🚀 Quick Start

### Installation

Install individual packages as needed:

```bash
# JavaScript utilities
npm install @thalesrc/js-utils

# TypeScript types
npm install @telperion/extra-ts-types

# RxJS utilities
npm install @telperion/rx-utils

# Nx utilities (dev dependency)
npm install -D @thalesrc/nx-utils

# Messenger (cross-context messaging)
npm install @telperion/messenger

# Paint API worklets
npm install @thalesrc/paintlet
```

### Usage Examples

**JavaScript Utilities:**
```typescript
import { compact, uniquify, debounce } from '@thalesrc/js-utils';

const arr = [1, 2, 2, 3, null, undefined, 4];
compact(arr);    // [1, 2, 2, 3, 4]
uniquify(arr);   // [1, 2, 3, null, undefined, 4]

debounce(() => console.log('Debounced!'), 300);
```

**Drag & Drop (via @telperion/elements):**
```html
<script type="module">
import '@telperion/elements/drag-drop';
</script>

<tha-drag name="item" draggingStrategy="move">
  <div>Drag me!</div>
</tha-drag>

<tha-dropzone accept="item">
  <div>Drop here!</div>
</tha-dropzone>
```

**RxJS Utilities:**
```typescript
import { interval } from 'rxjs';
import { toAsyncIteratable } from '@telperion/rx-utils';

const observable = interval(1000);
for await (const value of toAsyncIteratable(observable)) {
  console.log(value);
}
```

**Messenger:**
```typescript
import { IframeMessageClient, Request } from '@telperion/messenger/iframe';
import { Observable } from 'rxjs';

class MyClient extends IframeMessageClient {
  @Request('getData')
  fetchData(query: string): Observable<any> {
    return null!; // Implementation handled by decorator
  }
}

const client = new MyClient();
client.fetchData('user').subscribe(data => console.log(data));
```

---

## 🏗️ Monorepo Structure

This project is built with [Nx](https://nx.dev), a powerful build system for monorepos.

```
thalesrc/
├── libs/
│   ├── js-utils/              # JavaScript utilities
│   ├── ts-utils/              # TypeScript utilities
│   ├── extra-ts-types/        # TypeScript types
│   ├── dom-utils/             # DOM utilities
│   ├── paintlet/              # CSS Paint API worklets
│   ├── react-utils/           # React utilities
│   ├── rx-utils/              # RxJS utilities
│   ├── reactive-storage/      # Reactive storage
│   ├── messenger/             # Messaging library
│   ├── node-utils/            # Node.js utilities
│   ├── nx-utils/              # Nx executors
│   ├── auto-proxy/            # Auto proxy Docker image
│   └── docker-frp/            # FRP Docker image
├── nx.json
├── package.json
└── tsconfig.base.json
```

### Development Commands

```bash
# Run tests for a specific library
nx test js-utils

# Build a library
nx build elements

# Run all tests
nx run-many -t test

# Visualize the project graph
nx graph
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📖 Documentation

- [Website](https://thalesrc.com)
- [Documentation](https://open-source.thalesrc.com)
- [API Reference](https://open-source.thalesrc.com/api)
- [Examples](https://github.com/thalesrc/thalesrc/tree/main/examples)

---

## 📄 License

All packages in this repository are licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ali Şahin Özçelik**

- Website: [alisah.in](https://alisah.in)
- Email: alisahinozcelik@gmail.com
- GitHub: [@thalesrc](https://github.com/thalesrc)
- Twitter: [@thalesrc](https://twitter.com/thalesrc)

---

## 💖 Support

If you find these libraries helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs or suggesting features via [issues](https://github.com/thalesrc/thalesrc/issues)
- 💰 [Supporting on Patreon](https://www.patreon.com/alisahin)
- 📢 Sharing with your network

---

## 🔗 Links

- [GitHub Repository](https://github.com/thalesrc/thalesrc)
- [npm Organization](https://www.npmjs.com/org/thalesrc)
- [GitHub Packages](https://github.com/orgs/thalesrc/packages)
- [Issues](https://github.com/thalesrc/thalesrc/issues)
- [Discussions](https://github.com/thalesrc/thalesrc/discussions)

---

<div align="center">

**Made with ❤️ by [Telperion](https://github.com/telperiontech)**

</div>
