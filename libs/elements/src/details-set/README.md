# `<tp-details-set>`

A framework-agnostic grouping element for native `<details>` elements. It
manages the open/closed state of its **direct-child** `<details>` elements and
enforces a configurable cap via the `max-open-items` attribute. When the cap is
exceeded, the **earliest-opened** child is closed (FIFO).

The element renders into the **light DOM**, so consumers retain full control
over the styling of the slotted `<details>` / `<summary>` markup.

## Usage

```html
<script type="module">
  import "@telperion/elements";
</script>

<!-- Unlimited (default) -->
<tp-details-set>
  <details>
    <summary>One</summary>
    <p>Content one</p>
  </details>
  <details>
    <summary>Two</summary>
    <p>Content two</p>
  </details>
</tp-details-set>

<!-- Accordion (one at a time) -->
<tp-details-set max-open-items="1">
  <details><summary>A</summary>...</details>
  <details><summary>B</summary>...</details>
</tp-details-set>

<!-- Two-at-a-time, FIFO eviction -->
<tp-details-set max-open-items="2">
  <details open><summary>A</summary>...</details>
  <details><summary>B</summary>...</details>
  <details><summary>C</summary>...</details>
</tp-details-set>
```

## Attributes

| Attribute        | Type                       | Default     | Description                                                                                                            |
| ---------------- | -------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `max-open-items` | number                     | `0`         | Max direct-child `<details>` allowed open at once. `0` (or missing) = unlimited.                                       |
| `toggle-on`      | `"summary"` \| `"marker"` | `"summary"` | Default trigger for toggling. `"marker"` requires a click on a `[tp-summary-marker]` element. See [Toggle trigger](#toggle-trigger). |

## Behavior

- Only **direct-child** `<details>` elements are managed. Nested (descendant)
  `<details>` are ignored.
- When opening a child would exceed `max-open-items`, the child opened earliest
  is closed (FIFO).
- Lowering `max-open-items` at runtime closes the oldest open children until
  the new cap is satisfied.
- Adding a new already-open `<details>` (e.g. via DOM insertion) participates
  in the cap.
- Pre-opened (initially-`open`) children are seeded into the queue in document
  order.

## Events

| Event                    | Detail                                                          | Description                                       |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------- |
| `tp-details-set-change`  | `{ opened: HTMLDetailsElement[]; closed: HTMLDetailsElement[] }` | Fires when the cap forces one or more closures. |

For ordinary open/close, listen to the native `toggle` event on the children.

## Modern CSS

Smooth open/close animation is enabled by default via `interpolate-size:
allow-keywords` on the host plus a `block-size` transition on
`::details-content`. In engines that don't yet support these features, the
animation simply no-ops &mdash; the JS cap logic still works.

### CSS custom properties

| Property                                  | Default | Description                              |
| ----------------------------------------- | ------- | ---------------------------------------- |
| `--tp-details-set-transition-duration`    | `0.3s`  | Open/close transition duration.          |
| `--tp-details-set-transition-easing`      | `ease`  | Open/close transition timing function.   |

```css
tp-details-set.snappy {
  --tp-details-set-transition-duration: 0.15s;
  --tp-details-set-transition-easing: cubic-bezier(0.2, 0, 0, 1);
}
```

## Summary markers

Add one or more direct-child `<template summary-marker index="…">` elements to
clone consumer-authored DOM into every direct-child `<details>`'s `<summary>`.

```html
<tp-details-set max-open-items="1">
  <template summary-marker index="0">
    <span class="chev">▸</span>
  </template>
  <template summary-marker index="-1">
    <span class="badge">★</span>
  </template>

  <details><summary>One</summary>...</details>
  <details><summary>Two</summary>...</details>
</tp-details-set>
```

### `index` semantics

Resolved against `summary.childNodes.length` (so text nodes count too):

| `index`        | Behavior                                                          |
| -------------- | ----------------------------------------------------------------- |
| missing / `""` | `0` (prepend)                                                     |
| `0`            | Prepend                                                           |
| `n >= 0`       | Insert at position `n`, clamped to `length` (overflow appends)    |
| `-1`           | Append at the end                                                 |
| `-2`           | Insert before the last child                                      |
| `-n`           | `length - n + 1`, clamped to `0` (over-negative prepends)         |

### Multiple markers

When more than one marker template is present, they are applied in **document
order**. Each later marker sees the summary's current state &mdash; including
markers inserted by earlier templates &mdash; when computing its index. To
guarantee a marker stays at the very end regardless of earlier markers, use
`index="-1"` (which always resolves to the current end).

### Dynamic updates

- Markers are also applied to `<details>` elements added after the set is
  connected.
- Editing the template's content or its `index` attribute re-renders the
  markers in every summary (no stale nodes left behind).
- Removing a marker template removes its inserted nodes from every summary.

### State-aware styling

Markers are state-agnostic DOM. Use ordinary CSS to vary their appearance
based on the parent `<details>`'s state:

```css
tp-details-set > details > summary > [tp-summary-marker].chev {
  display: inline-block;
  transition: rotate 0.2s ease;
}

tp-details-set > details[open] > summary > [tp-summary-marker].chev {
  rotate: 90deg;
}
```

### `tp-summary-marker` attribute

Every cloned **element** node receives an empty `tp-summary-marker` attribute
on insertion (text/comment nodes are unaffected). This lets consumers target
markers via CSS / queries without adding extra wrapper classes:

```css
tp-details-set > details > summary > [tp-summary-marker] { /* ... */ }
```

The host stylesheet uses this attribute to **automatically hide the native
disclosure marker** on any `<summary>` that contains at least one
`[tp-summary-marker]` element &mdash; via `list-style: none`,
`::-webkit-details-marker`, and `::marker { content: "" }`. Consumers don't
need to add their own `summary { list-style: none }` rule.

### Limitations

- Only the **first `<summary>`** of each direct-child `<details>` is marked.
- A `<summary>` added inside an existing `<details>` after connect time is
  not auto-marked &mdash; markers are re-synced when the host's child list
  changes, not when descendants change.
- Nested (descendant) `<details>` are unaffected.

## Toggle trigger

By default, clicking anywhere on a `<summary>` toggles its `<details>`
(native browser behavior). Set `toggle-on="marker"` to require a click on a
`[tp-summary-marker]` element instead &mdash; useful when the summary itself
contains interactive content (links, buttons, form controls) that should not
trip the disclosure.

```html
<tp-details-set toggle-on="marker">
  <template summary-marker index="0"><span class="chev">▸</span></template>
  <details>
    <summary>Profile <a href="/edit">Edit</a></summary>
    ...
  </details>
</tp-details-set>
```

### Resolution

For each direct-child `<details>`, the effective mode is resolved as:

1. The `<details>`'s own `toggle-on` attribute, if it is `"summary"` or `"marker"`.
2. Otherwise, the host `<tp-details-set>`'s `toggle-on` attribute.
3. Otherwise, `"summary"`.

```html
<tp-details-set toggle-on="marker">
  <template summary-marker index="0"><span>▸</span></template>
  <details><summary>Marker only</summary>...</details>
  <details toggle-on="summary"><summary>Whole-summary toggleable</summary>...</details>
</tp-details-set>
```

### What counts as a "marker click"?

Any click whose `event.target` (or any ancestor up to the summary) carries the
`tp-summary-marker` attribute. This is the auto-applied attribute on every
cloned element in a `<template summary-marker>`, so children inside the marker
(e.g. an `<svg>` inside the marker `<span>`) also count as marker clicks.

### Carve-outs

- **Keyboard activation never breaks.** Pressing Enter / Space on a focused
  `<summary>` always toggles, even with `toggle-on="marker"`. (We detect the
  synthetic click via `event.detail === 0`.)
- **Empty-marker fallback.** If the effective mode is `"marker"` but the
  summary has no `[tp-summary-marker]` element, summary clicks toggle as
  normal. This prevents a details from becoming un-toggleable when markers
  are loaded async, removed, or simply not authored.
