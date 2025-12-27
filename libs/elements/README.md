# @thalesrc/elements

[![npm version](https://badge.fury.io/js/@thalesrc%2Felements.svg)](https://badge.fury.io/js/@thalesrc%2Felements)
[![npm](https://img.shields.io/npm/dm/@thalesrc/elements.svg)](https://www.npmjs.com/package/@thalesrc/elements)

A collection of custom web components built with [Lit Elements](https://lit.dev/). This library provides a suite of reusable, framework-independent web components for modern web applications.

## ✨ Features

- 🌐 **Framework Independent**: Built as custom web elements, works with any framework (React, Vue, Angular, Vanilla JS)
- 🔧 **Custom Components**: A growing collection of useful web components
- 🎨 **CSS Custom Properties**: Rich CSS variable support for styling
- 📦 **Modular**: Import only the components you need
- 🔄 **Reactive**: Built on Lit's reactive properties system
- 🎯 **TypeScript**: Full TypeScript support with type definitions

## 📦 Installation

```bash
npm install @thalesrc/elements
```

```bash
yarn add @thalesrc/elements
```

```bash
pnpm add @thalesrc/elements
```

## 🚀 Usage

```typescript
import '@thalesrc/elements';

// Use the components in your HTML
```

## 📚 Components

### Router Components

A complete client-side routing solution for single-page applications, built with declarative web components.

**Includes:**
- `<tha-router>` - Main router component managing URL matching and navigation
- `<tha-route>` - Route definitions with URLPattern syntax for path matching
- `<tha-router-outlet>` - Content rendering outlet for active routes
- `<tha-router-link>` - Navigation links with automatic active state detection
- `<tha-route-config>` - Global router configuration

**Features:**
- Template-based routing without JavaScript configuration
- Multiple history strategies (browser, hash, memory)
- Dynamic route parameters and wildcards
- Relative path navigation
- Automatic active link detection
- Signal-based reactive updates

[Router Documentation →](./src/router/README.md)

---

This library is actively being developed. More components will be added over time.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Thales RC](https://github.com/thalesrc)
