# `<tp-button>`

Framework-agnostic, form-associated button web component built with [Lit](https://lit.dev/). Behaves like the native `<button>` element &mdash; tab-selectable, activates on `Space` / `Enter`, and submits or resets its containing form. Color comes from the shared shade-mixer palette so any element built on `ShadeMixerLitElement` shares the same `color` / `shade` system.

## Highlights

- Three visual variants: `solid` &middot; `outline` &middot; `text`
- Form-associated via `ElementInternals` &mdash; `type="submit"` calls `form.requestSubmit()`, `type="reset"` calls `form.reset()`, and `.form` mirrors `HTMLButtonElement.form`
- Tab-selectable out of the box (`tabindex="0"`); `disabled` removes it from the tab order and blocks click + keyboard activation
- Keyboard activation on `Space` / `Enter`, just like native `<button>`
- Announces `role="button"` and toggles `aria-disabled` automatically
- Palette-driven color via `color` (`primary`, `secondary`, `success`, &hellip;) and `shade` (`0`&ndash;`1000`); `mixer` is auto-derived from `shade`
- Light-DOM rendering &mdash; consumer CSS / Tailwind / design tokens apply directly
- Smooth focus, hover, and active transitions handled in pure CSS

## Attributes

| Attribute  | Type / values                                                                                 | Default     | Description                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `variant`  | `solid` \| `outline` \| `text`                                                                | `solid`     | Visual treatment.                                                                            |
| `type`     | `button` \| `submit` \| `reset`                                                               | `button`    | Native button semantics. `submit` / `reset` act on the associated `<form>`.                  |
| `disabled` | boolean                                                                                       | `false`     | Removes the button from the tab order and blocks click/keyboard activation.                  |
| `color`    | `contrast` \| `primary` \| `secondary` \| `tertiary` \| `quaternary` \| `success` \| `danger` \| `warning` \| `neutral` | `contrast`  | Palette token (inherited from `ShadeMixerLitElement`).                                       |
| `shade`    | `0`&ndash;`1000`                                                                              | `500`       | Lighten/darken the chosen color. `500` is the base; lower mixes white, higher mixes black.   |
| `mixer`    | `none` \| `black` \| `white`                                                                  | `none`      | Read-only output, derived from `shade`. Reflects which side of the palette is being mixed.   |

`color`, `shade`, and `mixer` are inherited from [`ShadeMixerLitElement`](../utils/shade-mixer-lit-element.ts).

## CSS custom properties

| Property                       | Default                       | Description                                              |
| ------------------------------ | ----------------------------- | -------------------------------------------------------- |
| `--tp-button-color`            | `var(--tp-calc-element-color)`| Background color for `solid`, foreground for the others. |
| `--tp-button-contrast-color`   | `var(--tp-calc-contrast-color)`| Text color used by `solid`.                              |

The element also inherits the full set of palette tokens from `ShadeMixerLitElement` (`--tp-color-primary`, `--tp-color-success`, &hellip;), which can be overridden globally to re-theme every shade-mixer element at once.

## Theming

`<tp-button>` is the first &mdash; and currently the only &mdash; Telperion element that participates in the shared **shade-mixer design system**. Theming is applied entirely with CSS custom properties, so a consumer can override them at `:root` (global theme), at any ancestor selector (scoped theme), or even inline on a specific button.

### Override the built-in palette

The shade-mixer mixin auto-injects the following defaults onto `:root`. Re-declare any of them at any level to retheme every shade-mixer-aware element underneath:

```css
:root {
  --tp-color-white: hsl(0 0% 100%);
  --tp-color-black: hsl(0 0% 0%);
  --tp-color-contrast: var(--tp-color-black);
  --tp-color-primary: hsl(220 90% 56%);
  --tp-color-secondary: hsl(340 82% 52%);
  --tp-color-tertiary: hsl(50 100% 50%);
  --tp-color-quaternary: hsl(120 100% 40%);
  --tp-color-success: hsl(140 70% 40%);
  --tp-color-danger: hsl(0 70% 50%);
  --tp-color-warning: hsl(45 100% 50%);
  --tp-color-neutral: color-mix(in xyz, var(--tp-color-white) 50%, var(--tp-color-black) 50%);
}
```

Examples:

```css
/* Global rebrand */
:root {
  --tp-color-primary: hsl(280 80% 55%);
  --tp-color-success: hsl(160 70% 40%);
}

/* Dark-section theme: flip contrast and pick a different primary */
.dark-panel {
  --tp-color-contrast: var(--tp-color-white);
  --tp-color-primary: hsl(200 90% 60%);
}
```

The `shade` attribute (`0`&ndash;`1000`) automatically lightens or darkens the resolved color (`shade < 500` mixes `--tp-color-white`, `shade > 500` mixes `--tp-color-black`), so a single token expands into a full tonal range.

### Add custom color tokens

Need a brand color or status that isn&rsquo;t in the default palette? Add a single rule that supplies `--tp-element-color` for your chosen `color="…"` value &mdash; the shade mixer, hover/focus styles, and contrast color all derive from this one variable.

```css
tp-button[color="brand"] {
  --tp-element-color: hsl(265 75% 45%);
}

tp-button[color="info"] {
  --tp-element-color: hsl(200 85% 50%);
}
```

Use it like any other color:

```html
<tp-button color="brand">Brand action</tp-button>
<tp-button color="info" variant="outline" shade="300">Hint</tp-button>
```

The same trick works scoped to a section &mdash; declare the rule inside any selector to keep custom names local:

```css
.checkout tp-button[color="paypal"] {
  --tp-element-color: hsl(214 80% 35%);
}
```

## Form participation

`<tp-button>` is a form-associated custom element (`static formAssociated = true`). Place it inside a `<form>` and the relevant `type` triggers the same behaviour as a native button:

```html
<form>
  <input name="email" type="email" required />

  <tp-button type="submit" color="primary">Subscribe</tp-button>
  <tp-button type="reset" variant="outline">Reset</tp-button>
</form>
```

The associated form is also reachable in JS:

```ts
const button = document.querySelector("tp-button");
console.log(button.form); // -> <form> | null
```

## Accessibility

- The element exposes `role="button"` through `ElementInternals`.
- Disabled buttons set `aria-disabled="true"` and receive `tabindex="-1"`, so screen readers and keyboard users skip them.
- Activation via `Space` and `Enter` matches native button behaviour and dispatches a regular `click` event.

## Examples

### JS / TS

```ts
import "@telperion/elements/button";
```

### HTML

```html
<!-- Default solid primary button -->
<tp-button>Click me</tp-button>

<!-- Outline + success palette -->
<tp-button variant="outline" color="success">Save</tp-button>

<!-- Text variant in danger color -->
<tp-button variant="text" color="danger">Delete</tp-button>

<!-- Lightened (shade < 500) -->
<tp-button color="primary" shade="200">Subtle</tp-button>

<!-- Darkened (shade > 500) -->
<tp-button color="primary" shade="800">Bold</tp-button>

<!-- Disabled: not focusable, click/keyboard blocked -->
<tp-button disabled>Unavailable</tp-button>

<!-- Form submission -->
<form>
  <input name="q" />
  <tp-button type="submit">Search</tp-button>
</form>
```

## Browser support

Form-associated custom elements (`ElementInternals` + `static formAssociated`) require Chromium 77+, Firefox 98+, and Safari 16.4+. Color rendering uses modern CSS (`color-mix`, `attr()` typed values, `contrast-color()`) inherited from `ShadeMixerLitElement`; in older engines the button still works but the palette resolution may degrade.
