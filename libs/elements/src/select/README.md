# `<tp-select>`

Framework-agnostic, form-associated selectbox built on top of [`<tp-popover>`](../popover/README.md). Single-select by default; switches to multi-select with FIFO eviction via the `max` attribute. Selection state is signal-backed (via [`@lit-labs/signals`](https://www.npmjs.com/package/@lit-labs/signals)), so it stays reactive across nested shadow DOM boundaries through [`@lit/context`](https://lit.dev/docs/data/context/). The selected-option highlight color is driven by the shared shade-mixer palette — set `color` and `shade` to retheme the control with the same tokens used by `<tp-button>` and any other `ShadeMixerLitElement`-based element.

## Highlights

- Form-associated custom element — full `<form>` integration via `ElementInternals` (`name`, `disabled`, `required`, `formResetCallback`, `formStateRestoreCallback`, `validity`).
- Single- or multi-select via the `max` attribute (`1` by default; any positive integer; or the literal `infinite`).
- FIFO eviction when a new selection would exceed `max`; auto-trims when `max` is shrunk.
- Lower-bound floor via the `min` attribute — user-driven deselection is ignored once the selection size hits `min`.
- Auto-closes the popover when a new selection fills the quota; stays open while accumulating in multi-select.
- Palette-driven highlight color via the shared shade-mixer mixin — `color` (`primary`, `secondary`, …), `shade` (`0`–`1000`), and the auto-derived `mixer` flow into `--tp-select-selection-color` and `--tp-select-selection-contrast-color`.
- Composable through three slots:
  - `slot="button"` — replace the trigger.
  - `slot="popover"` — replace the panel rendering while keeping `<tp-option>` children registered in the select context.
  - default slot — projects `<tp-option>` children into the popover.
- `<tp-selected-content>` — drop-in mirror of the current selection, usable anywhere in the descendant composed tree (works across shadow boundaries).
- Light, signal-driven re-rendering via the `SignalWatcher` mixin — no manual change listeners.

## Members

- `<tp-select>` — the select element itself.
- `<tp-option>` — a single selectable item.
- `<tp-selected-content>` — mirrors the current selection (used as the trigger label by default).

## `<tp-select>`

### Attributes

| Attribute     | Type / values                       | Default            | Description                                                                                                                                       |
| ------------- | ----------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`       | comma-separated string              | `""`               | Reflects the joined values of the selected `<tp-option>`s. Setting it (re-)maps to options on the next microtask.                                 |
| `placeholder` | string                              | `Select an option` | Text shown by `<tp-selected-content>` when nothing is selected.                                                                                   |
| `max`         | positive integer \| `infinite`      | `1`                | `1` = single-select. Any positive integer = multi-select with FIFO eviction at the cap. `infinite` = unbounded (serialised back as `"infinite"`). |
| `min`         | non-negative integer                | `0`                | Minimum number of options that must stay selected. While the current selection is at or below `min`, user-driven deselection (clicks, `deselectOption`, `toggleOption`) is ignored — the option stays selected. Programmatic writes to `value` are not policed. |
| `name`        | string                              | _(none)_           | Form field name.                                                                                                                                  |
| `disabled`    | boolean                             | `false`            | Non-interactive; excluded from form submission.                                                                                                   |
| `required`    | boolean                             | `false`            | Empty selection sets `valueMissing`.                                                                                                              |
| `open`        | boolean                             | `false`            | Reflects the popover's open state (read-only — toggled by the popover, not by consumers).                                                         |
| `color`       | `contrast` \| `primary` \| `secondary` \| `tertiary` \| `quaternary` \| `success` \| `danger` \| `warning` \| `neutral` \| custom token | `contrast` | Palette token (inherited from `ShadeMixerLitElement`). Drives the selected-option highlight color and its contrast text color. |
| `shade`       | `0`&ndash;`1000`                    | `500`              | Lighten/darken the resolved `color`. `500` is the base; lower mixes white, higher mixes black. Inherited from `ShadeMixerLitElement`.            |
| `mixer`       | `none` \| `black` \| `white`        | `none`             | Read-only output, derived from `shade`. Inherited from `ShadeMixerLitElement`.                                                                    |

`color`, `shade`, and `mixer` are inherited from [`ShadeMixerLitElement`](../utils/shade-mixer-lit-element.ts) and behave the same way as on [`<tp-button>`](../button/README.md#theming) — override any palette token at `:root` (or any ancestor) to retheme every shade-mixer-aware element underneath.

### Slots

| Slot          | Purpose                                                                                                                                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`      | Replaces the default trigger. Embed `<tp-selected-content>` inside if you still want a live label.                                                                                                                                                 |
| `indicator`   | Replaces the default open/close caret (`▾`) shown inside the trigger button. Rotated 180° while the select is `open`.                                                                                                                              |
| `popover`     | Replaces the default rendering of the host's children inside the panel. The `<tp-option>` children remain registered in the select context (so they keep driving selection / validation / form submission) — they just aren't displayed any more. |
| `placeholder` | Replaces the default placeholder span shown by `<tp-selected-content>` when no option is selected. Forwarded by the light-DOM `<slot name="placeholder">` that `<tp-selected-content>` renders, so any direct child of `<tp-select>` carrying `slot="placeholder"` lands here (icon + text, custom markup, …). |
| _default_     | The `<tp-option>` items projected into the popover by default.                                                                                                                                                                                     |

### CSS Parts

All parts below sit inside `<tp-select>`'s shadow root, so they're styled with `tp-select::part(…)`. The last two come from the default `<tp-selected-content>` — they're exposed through this element only because `<tp-selected-content>` is light-DOM and is rendered inside the select's shadow root by default.

| Part                          | Element                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `button`                      | The trigger wrapper.                                                                               |
| `indicator`                   | The default open/close caret (`▾`); rotates 180° while `open`. Suppressed when the `indicator` slot is filled. |
| `popover`                     | The inner `<tp-popover>` panel.                                                                    |
| `selected-content`            | The default `<tp-selected-content>` rendered inside the trigger.                                   |
| `placeholder`                 | The `<span>` rendered by the default `<tp-selected-content>` when no option is selected.           |
| `selected-content-option`     | Each cloned `<tp-option>` mirrored by the default `<tp-selected-content>`.                         |

### CSS custom properties

| Property                                  | Default                          | Description                                                                                                                              |
| ----------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--tp-select-option-color`                | `white`                          | Background color of each `<tp-option>` in the popover.                                                                                   |
| `--tp-select-selection-color`             | `var(--tp-calc-element-color)`   | Background color of the currently selected option(s). Resolved by the shade-mixer from `color` + `shade`; override to bypass the math.   |
| `--tp-select-selection-contrast-color`    | `var(--tp-calc-contrast-color)`  | Text color used on top of `--tp-select-selection-color`. Resolved by the shade-mixer for legibility against the highlight.               |
| `--tp-select-highlight-percent`           | `20%`                            | Hover blend strength applied to both unselected and selected options.                                                                    |

The element also inherits the full set of palette tokens from `ShadeMixerLitElement` (`--tp-color-primary`, `--tp-color-success`, &hellip;), which can be overridden globally to re-theme every shade-mixer element at once. See the [theming notes on `<tp-button>`](../button/README.md#theming) &mdash; the same overrides apply here.

### Public API

| Member                                       | Description                                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `selectOption(option)`                       | Selects an option (FIFO-evicts the oldest when over `max`).                                  |
| `deselectOption(option)`                     | Removes an option from the current selection.                                                |
| `toggleOption(option)`                       | Toggles, applying the same FIFO eviction.                                                    |
| `togglePopover(force?)`                      | Open / close / toggle the dropdown popover. Overrides the native [`HTMLElement.togglePopover`](https://developer.mozilla.org/docs/Web/API/HTMLElement/togglePopover) and delegates to the inner `<tp-popover>` (the host element itself is not the popover). Pass `true` / `false` (or `{ force }`) to force a state, or omit to toggle. Returns the resulting open state. |
| `showPopover(options?)`                      | Open the dropdown popover. Overrides the native [`HTMLElement.showPopover`](https://developer.mozilla.org/docs/Web/API/HTMLElement/showPopover) and delegates to the inner `<tp-popover>`. |
| `hidePopover()`                              | Close the dropdown popover. Overrides the native [`HTMLElement.hidePopover`](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidePopover) and delegates to the inner `<tp-popover>`. |
| `value: string`                              | Get joined values; set with a comma-separated string to map back to options.                 |
| `selectedOptions: Signal<WeakRef<…>[]>`      | Underlying signal — read for fine-grained reactivity in custom UI.                           |
| `internals` / `form` / `validity` / …        | Standard form-associated surface from `ElementInternals`.                                    |
| `checkValidity()` / `reportValidity()`       | Standard form validity helpers.                                                              |

### Events

| Event    | Type                 | Description                                                                                                                                                            |
| -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `change` | `SelectChangeEvent`  | Dispatched whenever the selected option set changes. Bubbles, **not** composed (mirrors the native `<select>` `change` event). Not fired on initial mount or when the selection is re-set to the same value. |

`SelectChangeEvent extends Event` and exposes:

| Property          | Type                       | Description                                                       |
| ----------------- | -------------------------- | ----------------------------------------------------------------- |
| `value`           | `string`                   | Joined value of the new selection (same as `tp-select.value`).    |
| `selectedOptions` | `readonly OptionElement[]` | Snapshot of the currently selected `<tp-option>` elements.        |

```ts
import { SelectChangeEvent } from '@telperion/elements/select';

select.addEventListener('change', e => {
  if (e instanceof SelectChangeEvent) {
    console.log(e.value, e.selectedOptions);
  }
});
```

### Form integration

- `max === 1` → submits a single string (the value of the selected option).
- `max > 1` → submits a `FormData` with one entry per selected value under `name`, matching the wire format of native `<select multiple>`.
- `required` + empty selection → sets `valueMissing` with a friendly message.
- `formResetCallback` restores the initial `value` captured at construction.
- `formStateRestoreCallback` accepts strings and `FormData`.

## `<tp-option>`

### Attributes

| Attribute  | Type    | Description                                                                                  |
| ---------- | ------- | -------------------------------------------------------------------------------------------- |
| `value`    | string  | The submitted value when this option is selected.                                            |
| `selected` | boolean | Reflects current selection state. **Read-only** — driven by the host, do not set manually.   |

### Slots

| Slot      | Purpose                       |
| --------- | ----------------------------- |
| _default_ | Visible label for the option. |

`<tp-option>` discovers its host `<tp-select>` via `@lit/context`, so it can live anywhere in the descendant composed tree — including across shadow DOM boundaries.

## `<tp-selected-content>`

A lightweight, light-DOM mirror of the host's current selection. Falls back to the host's `placeholder` when no option is selected. Selected `<tp-option>`s are deeply cloned and projected into this element's light DOM; the clones are inert (they do not register back) and carry `part="selected-content-option"`. The placeholder fallback is wrapped in `<span part="placeholder">` and lives inside a `<slot name="placeholder">` — see below.

Use it as a drop-in label inside a custom `slot="button"`, or anywhere outside the trigger (e.g. as a live status line).

### Slots

| Slot          | Purpose                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `placeholder` | Replaces the default placeholder span shown when the host has no selection. Defaults to `<span part="placeholder">{placeholder}</span>`. |

Because this element renders into its own light DOM, the `<slot name="placeholder">` it emits ends up sitting inside its host's shadow root. When the host is `<tp-select>` (the default arrangement), that means a `slot="placeholder"` child of the `<tp-select>` is what fills it — see the `placeholder` slot of `<tp-select>` above.

The `part` attributes on the rendered nodes only become real Shadow Parts when this element lives inside another shadow root — which is what happens by default inside `<tp-select>`, where they surface as the [`placeholder`](#css-parts) and [`selected-content-option`](#css-parts) parts of `<tp-select>`. When used standalone in light DOM, those `part` attributes are inert; style the rendered content directly with descendant selectors instead.

## Examples

### Single-select with form integration

```html
<form>
  <tp-select name="fruit" required placeholder="Pick a fruit">
    <tp-option value="apple">Apple</tp-option>
    <tp-option value="banana">Banana</tp-option>
    <tp-option value="cherry">Cherry</tp-option>
  </tp-select>
  <button type="submit">Submit</button>
</form>
```

### Multi-select with FIFO cap

```html
<tp-select name="tags" max="3" placeholder="Pick up to 3">
  <tp-option value="apple">Apple</tp-option>
  <tp-option value="banana">Banana</tp-option>
  <tp-option value="cherry">Cherry</tp-option>
  <tp-option value="date">Date</tp-option>
</tp-select>

<!-- Unbounded: -->
<tp-select max="infinite">…</tp-select>
```

### Custom trigger button

```html
<tp-select max="infinite">
  <div slot="button" class="my-trigger">
    <span>🍇</span>
    <tp-selected-content></tp-selected-content>
  </div>
  <tp-option value="apple">Apple</tp-option>
  <tp-option value="banana">Banana</tp-option>
</tp-select>
```

### Custom popover content (options stay live, but hidden)

```html
<tp-select max="infinite" placeholder="Featured">
  <tp-option value="apple">Apple</tp-option>
  <tp-option value="cherry">Cherry</tp-option>

  <div slot="popover">
    <header>Featured</header>
    <p>Use the API to pick.</p>
    <button type="button" onclick="this.closest('tp-select').value = 'apple,cherry'">
      Pick apple + cherry
    </button>
  </div>
</tp-select>
```

### Standalone `<tp-selected-content>`

```html
<tp-select max="infinite">
  <tp-option value="apple">Apple</tp-option>
  <tp-option value="banana">Banana</tp-option>
</tp-select>

Current selection:
<strong><tp-selected-content></tp-selected-content></strong>
```

### Themed selection highlight

```html
<!-- Default palette token, base shade -->
<tp-select color="primary" placeholder="Primary">…</tp-select>

<!-- Lightened (shade < 500) -->
<tp-select color="success" shade="200" placeholder="Subtle success">…</tp-select>

<!-- Darkened (shade > 500) -->
<tp-select color="danger" shade="800" placeholder="Bold danger">…</tp-select>

<!-- Custom token -->
<style>
  tp-select[color="brand"] { --tp-element-color: hsl(265 75% 45%); }
</style>
<tp-select color="brand" placeholder="Brand">…</tp-select>
```

## Importing

```ts
import "@telperion/elements/select";
```

Or via a CDN script tag:

```html
<script src="https://unpkg.com/@telperion/elements/iife/select/index.js"></script>
```

## Browser support

Inherits the [`<tp-popover>`](../popover/README.md) requirements (native Popover API + CSS Anchor Positioning). Form association requires `ElementInternals` and `formAssociated` on custom elements (Chromium 77+, Firefox 98+, Safari 16.4+).
