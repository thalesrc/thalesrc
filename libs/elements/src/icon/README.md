# Icon

A framework-agnostic icon web component backed by [Material Symbols](https://fonts.google.com/icons).

## Overview

`<tp-icon>` renders a single Material Symbols glyph. It exposes the four Material variable-font axes (`FILL`, `wght`, `GRAD`, `opsz`) as plain HTML attributes, and it renders into the **light DOM** so consumer styling (Tailwind, global CSS, etc.) keeps working without `::part()` gymnastics.

### Key Features

- **Framework agnostic**: It's a custom element &mdash; works in any framework or vanilla HTML
- **Material Symbols ligatures**: Just put the icon name as text content (`<tp-icon>home</tp-icon>`)
- **All four axes exposed**: `filled`, `grade`, `weight`, `optical-size`
- **Three variants**: `outlined` (default), `round`, `sharp`
- **Light-DOM rendering**: Inherits the consumer's font color, size, and utility classes
- **Auto-rotating font URLs**: Loads fonts via the Google Fonts CSS API, so Google's periodic hash rotations on `fonts.gstatic.com` don't break you
- **Self-host friendly**: Swap one CSS file to ship the fonts yourself

## Installation

The icon element ships as part of `@telperion/elements`. See the [library README](../../README.md) for installation.

## Setup

Two things must happen before icons render:

1. **Register the element** &mdash; importing the module triggers `customElements.define()`:

   ```ts
   import "@telperion/elements/icon";
   ```

2. **Load the Material Symbols fonts** &mdash; import the bundled CSS once at the top of your app:

   ```ts
   import "@telperion/elements/icon/material-symbols.css";
   ```

   This file `@import`s the three variable fonts (Outlined, Rounded, Sharp) from the Google Fonts CSS API.

> **Why a separate CSS file?** Browsers cache the font files separately from your JS bundle, the API resolves to the latest revisioned `woff2` URL on every request (no stale hashes), and consumers who want to self-host can replace this single file without touching the element.

### Tailwind v4 consumers: register the package as a source

`<tp-icon>` applies a small set of Tailwind utility classes (`inline-block`, `leading-none`, `select-none`, `whitespace-nowrap`, `text-2xl`, `font-normal`, `not-italic`, `normal-case`, `tracking-normal`) from inside the published package. Tailwind v4's JIT scanner only looks at files inside your project by default, so unless you tell it to also scan `@telperion/elements`, those classes will be tree-shaken out of your build and the icon will render unstyled.

Add a single `@source` directive next to your `@import "tailwindcss"`:

```css
@import "tailwindcss";
@source "../node_modules/@telperion/elements";
```

Adjust the relative path so it points at `node_modules/@telperion/elements` from the file containing your Tailwind entry. Tailwind will then pick up every utility class the package emits &mdash; not just the icon element's defaults, but anything else any `@telperion/elements` module renders into the light DOM.

> If you use a non-default package manager layout (pnpm without hoisting, Yarn PnP, etc.), point `@source` at the actual resolved location, e.g. `@source "../node_modules/.pnpm/@telperion+elements@*/node_modules/@telperion/elements";`.

### Not using Tailwind? Import the baseline CSS instead

If your project doesn't use Tailwind v4, the utility classes the element auto-applies will have nothing to resolve against and the icon will render with browser defaults (italic-able, selectable, with normal line-height, etc.). Import the bundled baseline once to get the same defaults via plain CSS rules targeted at the `tp-icon` element:

```ts
import "@telperion/elements/icon/icon.css";
```

This file ships nine declarations (`display`, `font-style`, `font-weight`, `font-size`, `line-height`, `letter-spacing`, `text-transform`, `white-space`, `user-select`) on the `tp-icon` selector &mdash; equivalent to the Tailwind utilities the element applies, just authored as element-scoped CSS. Override anything you don't like with normal CSS specificity:

```css
tp-icon {
  font-size: 1.25rem;
}
```

> Tailwind users can ignore this file &mdash; the `@source` flow above already covers them. Importing it anyway is harmless (the rules are equivalent), just slightly redundant.

## Usage

```html
<!-- Default: outlined, weight 400, no fill -->
<tp-icon>home</tp-icon>

<!-- Rounded variant, filled, heavier weight, larger optical size -->
<tp-icon variant="round" filled weight="700" optical-size="48">favorite</tp-icon>

<!-- Sharp variant with a negative grade for a thinner look -->
<tp-icon variant="sharp" grade="-25">settings</tp-icon>
```

Browse glyph names at [fonts.google.com/icons](https://fonts.google.com/icons).

### Sizing & color

Because `<tp-icon>` renders in the light DOM, size and color come from normal CSS:

```html
<tp-icon style="font-size: 64px; color: tomato">favorite</tp-icon>
```

```css
tp-icon.brand {
  font-size: 2rem;
  color: var(--brand-primary);
}
```

The element pre-applies a small set of Tailwind v4 utility classes (`inline-block`, `leading-none`, `select-none`, `whitespace-nowrap`, etc.) for sane defaults.

## Element

### `<tp-icon>`

Renders a single glyph from the Material Symbols font family.

#### Attributes

| Attribute       | Type                                  | Default      | Description |
| --------------- | ------------------------------------- | ------------ | ----------- |
| `family`        | `"material"`                          | `"material"` | Icon family. Currently only Material Symbols is supported. Reflected. |
| `variant`       | `"outlined" \| "round" \| "sharp"`    | `"outlined"` | Material Symbols variant. Reflected. |
| `filled`        | boolean                               | `false`      | Sets the `FILL` axis to `1`. Reflected. |
| `grade`         | number (-25..200)                     | `0`          | Material Symbols `GRAD` axis. Reflected. |
| `weight`        | number (100..700)                     | `400`        | Material Symbols `wght` axis. Reflected. |
| `optical-size`  | number (20..48)                       | `24`         | Material Symbols `opsz` axis. Reflected. Property name: `opticalSize`. |

#### Slot

Default slot &mdash; the glyph name as text content (e.g. `home`, `favorite`, `settings`).

#### CSS Custom Properties

The element drives `font-variation-settings` via these CSS variables, so you can override any axis from your own stylesheet:

| Variable             | Default | Maps to             |
| -------------------- | ------- | ------------------- |
| `--tp-icon-fill`     | `0`     | `FILL` axis (0/1)   |
| `--tp-icon-weight`   | `400`   | `wght` axis         |
| `--tp-icon-grade`    | `0`     | `GRAD` axis         |
| `--tp-icon-opsz`     | `24`    | `opsz` axis         |

```css
/* Make every icon in the toolbar feel a touch heavier */
.toolbar tp-icon {
  --tp-icon-weight: 500;
}
```

## Self-hosting the fonts

If you don't want a runtime dependency on `fonts.googleapis.com`:

1. Download the variable fonts from [google/material-design-icons](https://github.com/google/material-design-icons/tree/master/variablefont).
2. Skip the import of `@telperion/elements/icon/material-symbols.css` and instead ship your own CSS with three `@font-face` blocks whose `font-family` values are exactly:
   - `Material Symbols Outlined`
   - `Material Symbols Rounded`
   - `Material Symbols Sharp`

The element references those names directly, so no other code changes are required.

## TypeScript

The custom element is registered on `HTMLElementTagNameMap`, so `document.createElement("tp-icon")` and `document.querySelector("tp-icon")` are typed as `IconElement`:

```ts
import type { IconElement } from "@telperion/elements/icon";

const icon = document.querySelector<IconElement>("tp-icon");
icon!.weight = 600;
icon!.filled = true;
```
