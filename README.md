# Telperion Technology Open Source Libraries

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/thalesrc/thalesrc?style=social)](https://github.com/thalesrc/thalesrc)
[![Twitter Follow](https://img.shields.io/twitter/follow/thalesrc?style=social)](https://twitter.com/thalesrc)

**A collection of high-quality, framework-independent utilities and tools for modern web development.**

[Website](https://thalesrc.com) • [Documentation](https://open-source.thalesrc.com) • [npm](https://www.npmjs.com/org/thalesrc) • [GitHub](https://github.com/thalesrc/thalesrc)

</div>

---

## 📦 Overview

Thalesrc is a comprehensive monorepo containing battle-tested libraries, utilities, and tools designed to simplify modern web development. From JavaScript utilities to Docker-based infrastructure tools, each package is crafted with performance, type safety, and developer experience in mind.

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

#### [@thalesrc/js-utils](https://www.npmjs.com/package/@thalesrc/js-utils)
[![npm](https://img.shields.io/npm/v/@thalesrc/js-utils.svg)](https://www.npmjs.com/package/@thalesrc/js-utils)
[![npm](https://img.shields.io/npm/dw/@thalesrc/js-utils.svg)](https://www.npmjs.com/package/@thalesrc/js-utils)

The swiss army knife of JavaScript utilities. A comprehensive collection of 50+ utility functions for arrays, objects, promises, strings, and more. Features include array manipulation, deep cloning, promise chains, debouncing, and smart type guards.

**Highlights**: Array utilities, Promise helpers, Object manipulation, String operations, Function utilities

#### [@thalesrc/extra-ts-types](https://www.npmjs.com/package/@thalesrc/extra-ts-types)
[![npm](https://img.shields.io/npm/v/@thalesrc/extra-ts-types.svg)](https://www.npmjs.com/package/@thalesrc/extra-ts-types)

Advanced TypeScript utility types for sophisticated type manipulations. Includes types like `PartialSome`, `DeepestValue`, `Join`, `Tail`, and more for working with complex type scenarios.

**Highlights**: Deep object navigation, Tuple manipulation, Constructor types, Partial utilities

#### [@thalesrc/ts-utils](libs/ts-utils)

TypeScript-specific utility types and helper functions built on top of the TypeScript compiler API.

**Highlights**: TypeScript utilities, Compiler helpers

---

### Web & DOM Utilities

#### [@thalesrc/dom-utils](libs/dom-utils)

Utility functions for DOM manipulation and browser APIs. Simplifies common DOM operations with a modern, type-safe API.

**Highlights**: DOM manipulation, Browser API helpers, Event handling

#### [@thalesrc/drag-drop](https://www.npmjs.com/package/@thalesrc/drag-drop)
[![npm](https://img.shields.io/npm/v/@thalesrc/drag-drop.svg)](https://www.npmjs.com/package/@thalesrc/drag-drop)
[![npm](https://img.shields.io/npm/dm/@thalesrc/drag-drop.svg)](https://www.npmjs.com/package/@thalesrc/drag-drop)

Framework-independent drag-and-drop library built with Lit Elements as custom web components. Provides extended drag-drop events, smart drop zones, drag handles, and multiple dragging strategies.

**Highlights**: Web Components, Custom events, Drop zone validation, Drag strategies, Cross-framework compatibility

#### [@thalesrc/elements](https://www.npmjs.com/package/@thalesrc/elements)
[![npm](https://img.shields.io/npm/v/@thalesrc/elements.svg)](https://www.npmjs.com/package/@thalesrc/elements)
[![npm](https://img.shields.io/npm/dm/@thalesrc/elements.svg)](https://www.npmjs.com/package/@thalesrc/elements)

Collection of custom web components built with Lit. Currently features a complete client-side routing solution with declarative components for SPAs. Includes router, route definitions, outlets, navigation links, and global configuration with support for multiple history strategies and reactive updates.

**Highlights**: Router components, Client-side routing, Template-based routes, URLPattern matching, Active link detection, Signal-based reactivity

#### [@thalesrc/paintlet](https://www.npmjs.com/package/@thalesrc/paintlet)

Pre-built CSS Paint API (Houdini) worklets for modern web development. Create stunning visual effects like ripples, rain animations, and organic gradients using the CSS Paint API.

**Highlights**: CSS Houdini, Paint worklets, Visual effects, Animated gradients

#### [@thalesrc/reactive-storage](libs/reactive-storage)

Reactive wrappers for browser storage APIs (localStorage, sessionStorage) with Observable patterns for real-time updates.

**Highlights**: Reactive storage, Observable patterns, Local/Session storage

#### [@thalesrc/rx-utils](https://www.npmjs.com/package/@thalesrc/rx-utils)
[![npm](https://img.shields.io/npm/v/@thalesrc/rx-utils.svg)](https://www.npmjs.com/package/@thalesrc/rx-utils)

Utility functions and operators for RxJS Observables. Features async iterable conversion, share operators, and Observable extensions.

**Highlights**: RxJS operators, AsyncIterable support, Observable utilities, Stream helpers

---

### Framework-Specific Utilities

#### [@telperion/ng-pack](libs/ng-pack)

Collection of Angular utilities and libraries organized as secondary entry points. Includes signal-based storage management, template-driven form utilities, and common Angular helpers.

**Sub-modules:**
- **storage-signals**: Signal-based localStorage/sessionStorage with reactive updates and nested property access
- **sse-client**: HttpClient-inspired SSE client with Observable-based streaming, interceptor chain, and reactive real-time updates
- **template-signal-forms**: Signal-based forms for template-driven forms _(under construction)_
- **utils**: Angular utilities including event modifiers, directive-as-service provider, and Promise-based HTTP client with tuple error handling

**Highlights**: Angular signals, Reactive storage, SSE client, Interceptors, Real-time streaming, Nested property access, Template forms, Event modifiers, HTTP utilities, Type-safe

#### [@thalesrc/react-utils](libs/react-utils)

React-specific utility hooks and components for modern React development. Simplifies common React patterns and state management.

**Highlights**: Custom hooks, React utilities, State management helpers

---

### Messaging & Communication

#### [@thalesrc/hermes](https://www.npmjs.com/package/@thalesrc/hermes)
[![npm](https://img.shields.io/npm/v/@thalesrc/hermes.svg)](https://www.npmjs.com/package/@thalesrc/hermes)
[![npm](https://img.shields.io/npm/dw/@thalesrc/hermes.svg)](https://www.npmjs.com/package/@thalesrc/hermes)
[![codecov](https://codecov.io/gh/thalesrc/thalesrc/graph/badge.svg?token=dz46LY3onk&flag=hermes)](https://codecov.io/gh/thalesrc/thalesrc?flag=hermes)

Cross-context messaging library for seamless communication across iframes, Chrome extensions, web workers, and broadcast channels. Built with RxJS for reactive message handling with decorators for clean, declarative APIs.

**Highlights**: Iframe messaging, Chrome extension support, Web Workers, Broadcast API, RxJS-based, Decorator API

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
npm install @thalesrc/extra-ts-types

# Drag & drop
npm install @thalesrc/drag-drop

# RxJS utilities
npm install @thalesrc/rx-utils

# Nx utilities (dev dependency)
npm install -D @thalesrc/nx-utils

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

**Drag & Drop:**
```html
<script type="module" src="node_modules/@thalesrc/drag-drop/bundle.mjs"></script>

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
import { toAsyncIteratable } from '@thalesrc/rx-utils';

const observable = interval(1000);
for await (const value of toAsyncIteratable(observable)) {
  console.log(value);
}
```

**Hermes Messaging:**
```typescript
import { IframeMessageClient, Request } from '@thalesrc/hermes/iframe';
import { Observable } from 'rxjs';

class MyClient extends IframeMessageClient {
  @Request('getData')
  fetchData(query: string): Observable<any> {
    return null; // Implementation handled by decorator
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
│   ├── drag-drop/             # Drag & drop library
│   ├── paintlet/              # CSS Paint API worklets
│   ├── react-utils/           # React utilities
│   ├── rx-utils/              # RxJS utilities
│   ├── reactive-storage/      # Reactive storage
│   ├── hermes/                # Messaging library
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
nx build drag-drop

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

**Made with ❤️ by [Thalesrc](https://github.com/thalesrc)**

</div>
