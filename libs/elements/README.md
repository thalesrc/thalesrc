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

> **Tailwind v4 consumers:** some elements (e.g. `<tp-icon>`) render Tailwind utility classes from inside the published package. Add `@source "@telperion/elements";` to your Tailwind entry CSS so the JIT scanner picks them up. See each module's README for details.

## 🚀 Usage

```typescript
import '@telperion/elements';

// Use the components in your HTML
```

### Loading via `<script>` tag (no bundler)

Every component module ships a self-contained, minified IIFE bundle that you can load directly from a CDN with a classic `<script>` tag &mdash; no bundler, no `import`, no npm install.

Use the **explicit `/iife/...` path** so the CDN serves the standalone bundle (subpath shorthand like `/icon` resolves to the ESM build via the package `exports` map and will not run as a classic script):

```html
<!-- All elements registered (TelperionElements global) -->
<script src="https://unpkg.com/@telperion/elements/iife/elements.js"></script>

<!-- Or just the icon module (TelperionElements.Icon) -->
<script src="https://unpkg.com/@telperion/elements/iife/icon/index.js"></script>

<!-- Or just the router module (TelperionElements.Router) -->
<script src="https://unpkg.com/@telperion/elements/iife/router/index.js"></script>

<!-- Or just the drag-and-drop module (TelperionElements.DragDrop) -->
<script src="https://unpkg.com/@telperion/elements/iife/drag-drop/index.js"></script>

<!-- Or just the details-set module (TelperionElements.DetailsSet) -->
<script src="https://unpkg.com/@telperion/elements/iife/details-set/index.js"></script>

<!-- Or just the popover module (TelperionElements.Popover) -->
<script src="https://unpkg.com/@telperion/elements/iife/popover/index.js"></script>

<!-- Or just the select module (TelperionElements.Select) -->
<script src="https://unpkg.com/@telperion/elements/iife/select/index.js"></script>
```

Each per-module bundle is fully self-contained: side-effect imports register the custom elements as soon as the script is evaluated. jsDelivr (`https://cdn.jsdelivr.net/npm/@telperion/elements/iife/...`) and other npm CDNs work the same way.

> The package also declares a non-standard `"script"` export condition pointing at these files for tooling that wants to discover them programmatically, but no browser or major CDN currently resolves it &mdash; always use the full `/iife/...` path in `<script src>`.

## 📚 Components

### Icon

A framework-agnostic icon element with two families: Material Symbols and Simple Icons (brand icons).

**Includes:**
- `<tp-icon>` &mdash; renders a single glyph from the chosen family

**Features:**
- **Material Symbols**: three variants (`outlined`, `round`, `sharp`) and all four variable-font axes exposed as attributes (`filled`, `grade`, `weight`, `optical-size`)
- **Simple Icons** (`family="simple-icons"`): brand icons (YouTube, LinkedIn, GitHub, …) loaded on demand from `cdn.simpleicons.org` into a single shared `<svg>` sprite &mdash; one HTTP request per slug, ever; auto `aria-label` from the brand title; `tp-icon-load` / `tp-icon-error` events; configurable base URL for self-hosting
- **theSVG** (`family="thesvg"`): multi-color, multi-variant brand icons from [thesvg.org](https://thesvg.org) (~5,600 SVGs). Lazy-fetched into a separate `<svg data-tp-thesvg>` sprite with per-symbol id namespacing so multi-gradient logos coexist without collisions. `variant` attribute selects `default` / `mono` / `wordmark` / …; `tp-icon-load` / `tp-icon-error` events fire with `{ slug, variant, viewBox }`; configurable base URL.
- Light-DOM rendering so consumer styling (Tailwind, CSS variables, color/size) "just works"
- Material Symbols fonts loaded via the Google Fonts CSS API &mdash; no broken hash URLs when Google rotates them; self-host friendly

#### JS/TS
```ts
import "@telperion/elements/icon";
```

#### CSS
```css
@import "@telperion/elements/icon/material-symbols.css";
```

#### HTML
```html
<tp-icon>home</tp-icon>
<tp-icon variant="round" filled weight="700">favorite</tp-icon>
<tp-icon family="simple-icons" slug="facebook" style="color:#1877F2"></tp-icon>
<tp-icon family="thesvg" slug="google" variant="wordmark"></tp-icon>
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

### Details Set

A grouping element for native `<details>` that caps how many can be open at
once, supports cloned summary markers, and offers marker-only toggling.

**Includes:**
- `<tp-details-set>` &mdash; manages direct-child `<details>` elements

**Features:**
- `max-open-items` attribute &mdash; FIFO eviction when the cap is exceeded (`0` = unlimited)
- Declarative summary markers via `<template summary-marker index="…">` direct children &mdash; cloned into every direct-child `<summary>` at the requested splice index; multiple templates and dynamic add/remove supported
- Cloned marker elements are auto-tagged with `tp-summary-marker` so the native disclosure triangle is hidden and CSS can style markers state-aware (`details[open] > summary > [tp-summary-marker]`)
- `toggle-on="summary" | "marker"` (set-level + per-`<details>` override) &mdash; restrict toggling to clicks on the marker (keyboard activation always works; falls back to summary-toggle when no marker is present)
- `tp-details-set-change` event with `{ opened, closed }` arrays
- Light-DOM rendering; modern CSS (`::details-content`, `interpolate-size`) opt-in for animated open/close

#### JS/TS
```ts
import "@telperion/elements/details-set";
```

#### HTML
```html
<tp-details-set max-open-items="1" toggle-on="marker">
  <template summary-marker index="0"><span class="chev">▸</span></template>
  <details><summary>One</summary>...</details>
  <details><summary>Two</summary>...</details>
</tp-details-set>
```

[Details Set Documentation →](./src/details-set/README.md)

---

### Popover

Framework-agnostic popover element built on the native [Popover API](https://developer.mozilla.org/docs/Web/API/Popover_API) and [CSS Anchor Positioning](https://developer.mozilla.org/docs/Web/CSS/CSS_anchor_positioning). Placement is **pure CSS** — JavaScript only parses attributes, resolves the anchor, and (optionally) wires triggers.

**Includes:**
- `<tp-popover>` &mdash; auto-applies the native `popover` attribute and anchors itself via CSS

**Features:**
- Auto `popover` attribute (`auto` by default; switch with `mode="manual"`)
- Anchor resolved from a `target` querySelector string, falling back to `parentElement`
- Declarative `position` syntax with three forms:
  - Full: `<pop-inline> to <target-inline> / <pop-block> to <target-block>`
  - Two-keyword: `<inline> / <block>` (e.g. `center / top`)
  - Single axis or single keyword (e.g. `top to bottom`, `start`, `bottom`)
- Inline keywords: `start | center | end`; block keywords: `top | middle | bottom`
- Optional `trigger="click" | "hover"` (hover also opens on focus)
- Use plain CSS `margin` on the popover for a gap from its anchor
- Automatic edge-flipping via the default `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline` (override with `position-try-fallbacks: none`)
- Light-DOM rendering; no JS positioning loop

#### JS/TS
```ts
import "@telperion/elements/popover";
```

#### HTML
```html
<div>
  <button>Anchor</button>
  <tp-popover position="top">Above the parent.</tp-popover>
</div>

<button id="trigger">Click me</button>
<tp-popover target="#trigger" position="start / bottom" trigger="click">
  Anchored via target="#trigger".
</tp-popover>
```

[Popover Documentation →](./src/popover/README.md)

---

### Select

Form-associated, framework-agnostic selectbox built on `<tp-popover>`. Single-select by default; switches to multi-select with FIFO eviction via `max`. Selection state is signal-backed and discoverable across nested shadow DOM boundaries via `@lit/context`.

**Includes:**
- `<tp-select>` &mdash; the selectbox itself
- `<tp-option>` &mdash; a single selectable item
- `<tp-selected-content>` &mdash; live mirror of the current selection (used as the trigger label by default)

**Features:**
- Form-associated custom element with full `<form>` integration via `ElementInternals` (`name`, `disabled`, `required`, reset/restore callbacks, `validity`)
- `max` attribute &mdash; `1` for single-select, any positive integer for multi-select with FIFO eviction at the cap, or `infinite` for unbounded selection
- Single-select submits a string; multi-select submits a `FormData` with one entry per value (matching native `<select multiple>`)
- Auto-closes the popover when a selection fills the quota; stays open while accumulating in multi-select
- Three slots: `slot="button"` (replace trigger), `slot="popover"` (replace panel content while keeping `<tp-option>` children registered for selection / validation / submission), and the default slot (option list)
- `<tp-selected-content>` works anywhere in the descendant composed tree &mdash; including across shadow DOM boundaries
- Signal-driven re-rendering via the `SignalWatcher` mixin &mdash; no manual change listeners

#### JS/TS
```ts
import "@telperion/elements/select";
```

#### HTML
```html
<tp-select name="fruit" required placeholder="Pick a fruit">
  <tp-option value="apple">Apple</tp-option>
  <tp-option value="banana">Banana</tp-option>
  <tp-option value="cherry">Cherry</tp-option>
</tp-select>

<!-- Multi-select with FIFO cap of 3 -->
<tp-select name="tags" max="3">…</tp-select>

<!-- Unbounded multi-select -->
<tp-select name="tags" max="infinite">…</tp-select>
```

[Select Documentation →](./src/select/README.md)

---

This library is actively being developed. More components will be added over time.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Telperion Technology](https://github.com/telperiontech)
