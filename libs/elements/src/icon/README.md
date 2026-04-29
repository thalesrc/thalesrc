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
@source "@telperion/elements/icon";
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

| Attribute       | Type                                                  | Default      | Description |
| --------------- | ----------------------------------------------------- | ------------ | ----------- |
| `family`        | `"material" \| "simple-icons" \| "thesvg"`             | `"material"` | Icon family. Reflected. |
| `variant`       | `string`                                              | `"outlined"` | Per-family variant: Material `"outlined"` / `"round"` / `"sharp"`; theSVG e.g. `"default"`, `"mono"`, `"wordmark"` (defaults to `"default"` when no `variant` attribute is set). Reflected. |
| `filled`        | boolean                                               | `false`      | Sets the `FILL` axis to `1`. Reflected. |
| `grade`         | number (-25..200)                                     | `0`          | Material Symbols `GRAD` axis. Reflected. |
| `weight`        | number (100..700)                                     | `400`        | Material Symbols `wght` axis. Reflected. |
| `optical-size`  | number (20..48)                                       | `24`         | Material Symbols `opsz` axis. Reflected. Property name: `opticalSize`. |
| `slug`          | string                                                | &mdash;      | Slug for `simple-icons` and `thesvg` families. Reflected. |
| `loading`       | boolean                                               | `false`      | Reflected while a remote-icon (Simple Icons / theSVG) fetch is in flight. |
| `errored`       | boolean                                               | `false`      | Reflected after a failed remote-icon fetch. |

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

## Simple Icons (brand icons)

`<tp-icon>` ships a second family backed by [Simple Icons](https://simpleicons.org), the canonical brand-icon set (YouTube, LinkedIn, GitHub, Facebook, …). Switch via `family="simple-icons"` and pick an icon by its Simple Icons slug:

```html
<tp-icon family="simple-icons" slug="facebook" style="color: #1877F2; font-size: 64px"></tp-icon>
<tp-icon family="simple-icons" slug="youtube"  style="color: #FF0000; font-size: 64px"></tp-icon>
<tp-icon family="simple-icons" slug="linkedin" style="color: #0A66C2; font-size: 64px"></tp-icon>
```

Browse slugs at [simpleicons.org](https://simpleicons.org).

### How it works

The element keeps a single hidden `<svg>` sprite at the bottom of `document.body`. The first time a slug is seen, it fetches `https://cdn.simpleicons.org/<slug>`, extracts the path and the brand title, and appends a new `<symbol id="tp-si-<slug>">` to the sprite. Every `<tp-icon>` for that slug then renders as `<svg><use href="#tp-si-<slug>"/></svg>` &mdash; one DOM node per instance, one HTTP request per slug, ever.

### Coloring

Simple Icons SVGs render via `currentColor`, so set `color` on the element (or any ancestor) and the icon follows:

```html
<tp-icon family="simple-icons" slug="github" style="color: #181717"></tp-icon>
<button class="text-rose-600">
  <tp-icon family="simple-icons" slug="heart"></tp-icon>
</button>
```

### Sizing

Injected SVGs are constrained to `1em × 1em` so they behave like glyphs. Set `font-size` on the host (or any ancestor) to scale.

### Accessibility

When you don't set `aria-label` explicitly, the element auto-applies the brand title from the CDN response (e.g. `"Facebook"`). An explicit `aria-label` always wins:

```html
<!-- Reads as "Facebook" -->
<tp-icon family="simple-icons" slug="facebook"></tp-icon>

<!-- Reads as "Like us on Facebook" -->
<tp-icon family="simple-icons" slug="facebook" aria-label="Like us on Facebook"></tp-icon>
```

### Lifecycle

| Reflected attribute | Meaning |
| ------------------- | ------- |
| `loading`           | Set while a slug is being fetched. |
| `errored`           | Set after the most recent fetch failed (network, 404, parse). |

```css
tp-icon[loading]  { opacity: 0.5; }
tp-icon[errored]  { display: none; }
```

| Event             | `detail`                     | When |
| ----------------- | ---------------------------- | ---- |
| `tp-icon-load`    | `{ slug, title }`            | Sprite symbol is in place. |
| `tp-icon-error`   | `{ slug, error }`            | Fetch / parse failed. |

Both events bubble and cross shadow boundaries.

### Self-hosting the CDN

If you don't want a runtime dependency on `cdn.simpleicons.org`, mirror the asset path locally and point the element at it once at startup:

```ts
import { setSimpleIconsBaseUrl } from "@telperion/elements/icon";

setSimpleIconsBaseUrl("/assets/simple-icons");
```

The element then issues `GET /assets/simple-icons/<slug>`. The response must be the same single-path, `viewBox="0 0 24 24"` SVG that simpleicons.org serves &mdash; the [`simple-icons`](https://www.npmjs.com/package/simple-icons) npm package ships exactly that under `node_modules/simple-icons/icons/<slug>.svg`.

### Preloading

For above-the-fold icons, kick off the fetch before the element mounts:

```ts
import { loadSimpleIcon } from "@telperion/elements/icon";

await Promise.all(["facebook", "youtube", "linkedin"].map(loadSimpleIcon));
```

## theSVG (multi-color brand library)

`<tp-icon>` ships a third family backed by [theSVG](https://thesvg.org), the GLINCKER open brand library (~5,600 multi-color, multi-variant brand SVGs). Switch via `family="thesvg"` and pick an icon by slug + variant:

```html
<tp-icon family="thesvg" slug="google"                       style="font-size: 64px"></tp-icon>
<tp-icon family="thesvg" slug="google"   variant="mono"      style="font-size: 64px"></tp-icon>
<tp-icon family="thesvg" slug="google"   variant="wordmark"  style="font-size: 64px"></tp-icon>
<tp-icon family="thesvg" slug="microsoft"                    style="font-size: 64px"></tp-icon>
```

Browse icons and variants at [thesvg.org](https://thesvg.org).

### How it works

Like the Simple Icons family, theSVG uses one hidden `<svg data-tp-thesvg>` sprite at the bottom of `document.body`. The first time a `(slug, variant)` pair is seen, the element fetches `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/<slug>/<variant>.svg`, clones the entire SVG body into a `<symbol id="tp-thesvg-<slug>-<variant>">`, **namespaces every internal `id`** (and rewrites the matching `url(#…)` / `href="#…"` / `xlink:href="#…"` references) so multi-gradient icons can coexist without colliding, and appends the symbol to the sprite. Every subsequent `<tp-icon>` for the same pair renders as `<svg><use href="#tp-thesvg-<slug>-<variant>"/></svg>` &mdash; one DOM node per instance, one HTTP request per pair.

### Differences vs. Simple Icons

- **Multi-color**: Colors are baked into the SVG. The element does **not** force `currentColor`; the icon's own paint wins.
- **Multi-variant**: Most icons ship multiple variants (`default`, `mono`, `wordmark`, …). Pick via the `variant` attribute. When no `variant` attribute is set the element defaults to `"default"`.
- **Aspect-aware sizing**: Wordmark variants aren't square. Injected SVGs use `height: 1em; width: auto` instead of `1em × 1em`, so wordmarks aren't squished. Set `font-size` to scale.
- **No auto `aria-label`**: theSVG responses don't ship a `<title>` element. The element does not invent one &mdash; supply your own `aria-label` (or `role="img"` + visible label) when the icon is meaningful.

### Sizing

Injected SVGs are constrained to `height: 1em; width: auto`. For wordmarks, bump `font-size`:

```html
<tp-icon family="thesvg" slug="google" variant="wordmark" style="font-size: 96px"></tp-icon>
```

### Accessibility

Add your own label whenever the icon conveys meaning:

```html
<a href="https://google.com" aria-label="Sign in with Google">
  <tp-icon family="thesvg" slug="google"></tp-icon>
</a>
```

Decorative icons can stay unlabeled; the injected `<svg aria-hidden="true">` keeps assistive tech quiet.

### Lifecycle

Reuses the Simple Icons reflected attributes (`loading`, `errored`) and CSS event hooks. Events:

| Event             | `detail`                              | When |
| ----------------- | ------------------------------------- | ---- |
| `tp-icon-load`    | `{ slug, variant, viewBox }`          | Sprite symbol is in place. |
| `tp-icon-error`   | `{ slug, variant, error }`            | Fetch / parse failed. |

### Self-hosting the CDN

Mirror the asset tree locally and point the element at it once at startup:

```ts
import { setTheSvgBaseUrl } from "@telperion/elements/icon";

// jsDelivr by default; switch to the canonical site, a private mirror, or your CDN.
setTheSvgBaseUrl("https://thesvg.org/icons");
// or
setTheSvgBaseUrl("/assets/thesvg");
```

The element then issues `GET <baseUrl>/<slug>/<variant>.svg`. The response must be a standalone SVG with a `viewBox` attribute on the root element &mdash; identical to the upstream `glincker/thesvg` repo's `public/icons/<slug>/<variant>.svg` files.

### Preloading

Kick off the fetch for above-the-fold icons before they mount:

```ts
import { loadTheSvgIcon } from "@telperion/elements/icon";

await Promise.all([
  loadTheSvgIcon("google"),
  loadTheSvgIcon("google", "mono"),
  loadTheSvgIcon("microsoft"),
]);
```

### Discovering loaded variants

`listLoadedTheSvgVariants(slug)` returns the variants currently materialised in the sprite (i.e. ones the page has already requested). It is a **DOM read, not a network call** &mdash; it does not enumerate the full upstream catalog.

```ts
import { listLoadedTheSvgVariants } from "@telperion/elements/icon";

listLoadedTheSvgVariants("google"); // → ["default", "mono"] (after both have loaded)
```

### Trademark & license

The theSVG markup is released under [CC0-1.0](https://github.com/glincker/thesvg/blob/main/LICENSE), but the **logos themselves remain trademarks of their respective owners**. Make sure your usage complies with each brand's trademark guidelines &mdash; see [glincker/thesvg › TRADEMARK.md](https://github.com/glincker/thesvg/blob/main/TRADEMARK.md) for the project's own notice.

## TypeScript

The custom element is registered on `HTMLElementTagNameMap`, so `document.createElement("tp-icon")` and `document.querySelector("tp-icon")` are typed as `IconElement`:

```ts
import type { IconElement } from "@telperion/elements/icon";

const icon = document.querySelector<IconElement>("tp-icon");
icon!.weight = 600;
icon!.filled = true;
```
