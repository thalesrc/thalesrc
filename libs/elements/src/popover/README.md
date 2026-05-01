# `<tp-popover>`

Framework-agnostic popover element built on the native [Popover API](https://developer.mozilla.org/docs/Web/API/Popover_API) and [CSS Anchor Positioning](https://developer.mozilla.org/docs/Web/CSS/CSS_anchor_positioning). Placement is **pure CSS** — JavaScript only parses attributes, resolves the anchor target, and (optionally) wires triggers.

## Highlights

- Auto-applies the native `popover` attribute (`auto` by default; switch with `mode="manual"`).
- Resolves anchor from a `target` querySelector string, falling back to `parentElement`.
- Declarative `position` syntax with shorthands (`center / top`, `start`, `top to bottom`, …).
- Optional `trigger` support (`click` / `hover`).
- Use plain CSS `margin` on the popover to add a gap from its anchor.
- Automatic edge-flipping via the default `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline`.

## Attributes

| Attribute       | Type / values                                     | Default                            | Description                                                                |
| --------------- | ------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `mode`          | `auto` \| `manual`                                | `auto`                             | Mirrored to the native `popover` attribute.                                |
| `target`        | querySelector string                              | _(parent element)_                 | Anchor element. Falls back to `parentElement` if missing/unresolved.       |
| `position`      | `<p-inl> to <t-inl> / <p-blk> to <t-blk>`         | `center to center / bottom to top` | Placement spec. See grammar below.                                         |
| `trigger`       | `manual` \| `click` \| `hover`                    | `manual`                           | How the resolved target opens the popover. `hover` also opens on focus.    |

### Position grammar

Three forms are accepted:

```
<pop-inline> to <target-inline> / <pop-block> to <target-block>   # full
<inline> / <block>                                                # two-keyword
<single-axis-or-keyword>                                          # single (no `/`)
```

- Inline keywords: `start` · `center` · `end`
- Block keywords: `top` · `middle` · `bottom`

The full form names the popover edge → target edge on each axis. For example, `position="center to center / bottom to top"` puts the popover **above** its target and **horizontally centered** to it.

**Two-keyword shorthand** picks the natural "outside" mapping per axis:

| Inline   | Expands to        |     | Block    | Expands to          |
| -------- | ----------------- | --- | -------- | ------------------- |
| `start`  | `end to start`    |     | `top`    | `bottom to top`     |
| `center` | `center to center`|     | `middle` | `middle to middle`  |
| `end`    | `start to end`    |     | `bottom` | `top to bottom`     |

So `center / top` ≡ `center to center / bottom to top`, and `end / bottom` ≡ `start to end / top to bottom`. Each half may also be the full `a to b` form.

**Single axis** (no `/`) — pass just one half (`<a> to <b>` or a single keyword) and the other axis defaults to its centered/middle form. E.g. `top to bottom` ≡ `center to center / top to bottom`, `start to center` ≡ `start to center / middle to middle`.

**Single keyword** picks the same mapping for one axis and centers/middles the other:

| Value    | Expands to                       |
| -------- | -------------------------------- |
| `start`  | `end to start / middle to middle`|
| `center` | `center to center / middle to middle` |
| `end`    | `start to end / middle to middle`|
| `top`    | `center to center / bottom to top`|
| `middle` | `center to center / middle to middle` |
| `bottom` | `center to center / top to bottom`|

### Gap between popover and anchor

Use plain CSS `margin` on the popover element. Because the popover is absolutely positioned via anchor positioning, the margin shifts it away from the anchor edge it is pinned to:

```css
tp-popover {
  margin: 0.5rem;
}
```

## Examples

```html
<!-- Anchor to parent. -->
<div>
  Anchor
  <tp-popover position="center to center / bottom to top">Above the parent.</tp-popover>
</div>

<!-- Anchor to an element by selector + click trigger. -->
<button id="trigger">Click me</button>
<tp-popover
  target="#trigger"
  position="start to start / top to bottom"
  trigger="click"
>
  Popover content.
</tp-popover>

<!-- Automatic edge-flipping is on by default. Disable it with: -->
<style>
  tp-popover.no-flip { position-try-fallbacks: none; }
</style>
<tp-popover class="no-flip" position="center to center / bottom to top">
  Stays put even when clipped.
</tp-popover>
```

## Browser support

Requires native Popover API and CSS Anchor Positioning. In engines that do not yet support `anchor()` / `position-try-fallbacks`, the popover still opens but placement degrades to the browser default.
