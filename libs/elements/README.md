# @telperion/elements

[![npm version](https://badge.fury.io/js/@telperion%2Felements.svg)](https://badge.fury.io/js/@telperion%2Felements)
[![npm](https://img.shields.io/npm/dm/@telperion/elements.svg)](https://www.npmjs.com/package/@telperion/elements)

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
npm install @telperion/elements
```

```bash
yarn add @telperion/elements
```

```bash
pnpm add @telperion/elements
```

> **Tailwind v4 consumers:** some elements (e.g. `<tp-icon>`) render Tailwind utility classes from inside the published package. Add `@source "../node_modules/@telperion/elements";` to your Tailwind entry CSS so the JIT scanner picks them up. See each module's README for details.

## 🚀 Usage

```typescript
import '@telperion/elements';

// Use the components in your HTML
```

## 📚 Components

### Icon

A framework-agnostic Material Symbols icon element.

**Includes:**
- `<tp-icon>` &mdash; renders a single Material Symbols glyph

**Features:**
- Three variants: `outlined` (default), `round`, `sharp`
- All four Material variable-font axes exposed as attributes (`filled`, `grade`, `weight`, `optical-size`)
- Light-DOM rendering so consumer styling (Tailwind, CSS variables, color/size) "just works"
- Loads fonts via the Google Fonts CSS API &mdash; no broken hash URLs when Google rotates them
- Self-host friendly &mdash; swap one CSS file to ship the fonts yourself

```ts
import "@telperion/elements/icon";
import "@telperion/elements/icon/material-symbols.css";
```

```html
<tp-icon>home</tp-icon>
<tp-icon variant="round" filled weight="700">favorite</tp-icon>
```

[Icon Documentation →](./src/icon/README.md)

---

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
