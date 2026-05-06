import { css, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { uniquify } from '@telperion/js-utils/array/uniquify';
import { minMax } from "@telperion/js-utils/math/min-max";

export type PredefinedColors = "contrast" | "primary" | "secondary" | "tertiary" | "quaternary" | "success" | "danger" | "warning" | "neutral";
export type ShadeMixerType = "none" | "black" | "white";

/**
 * Base class that powers Telperion's shared color/design system.
 *
 * Elements that extend `ShadeMixerLitElement` participate in a fully themable
 * palette driven entirely by CSS custom properties. The class:
 *
 * 1. Auto-injects a default palette onto `:root` &mdash; `--tp-color-white`,
 *    `--tp-color-black`, `--tp-color-contrast`, `--tp-color-primary`,
 *    `--tp-color-secondary`, `--tp-color-tertiary`, `--tp-color-quaternary`,
 *    `--tp-color-success`, `--tp-color-danger`, `--tp-color-warning`, and
 *    `--tp-color-neutral`. Override any of them at `:root` or any ancestor to
 *    re-theme every shade-mixer-aware element underneath.
 * 2. Exposes `shadedElementStyles` &mdash; a `css` block that resolves the
 *    selected `color` to `--tp-element-color`, applies the `shade`/`mixer`
 *    math, and exposes the result as `--tp-calc-element-color` and
 *    `--tp-calc-contrast-color` for consumers (variants, hover, focus, …).
 *    Subclasses include it once in their own host rule.
 * 3. Provides three reflected attributes that drive the math:
 *    - `color` &mdash; palette token name (predefined or custom).
 *    - `shade` (`0`&ndash;`1000`, default `500`) &mdash; lighten/darken the
 *      resolved color (`<500` mixes white, `>500` mixes black).
 *    - `mixer` (`none` / `black` / `white`) &mdash; read-only output, auto-set
 *      whenever `shade` changes.
 *
 * **Adding custom color tokens.** If the predefined names are not enough,
 * declare a new selector that supplies `--tp-element-color`:
 *
 * ```css
 * tp-button[color="brand"] {
 *   --tp-element-color: hsl(265 75% 45%);
 * }
 * ```
 *
 * The shade math, hover/focus styles, and contrast color all derive from this
 * one variable, so the new token "just works" with `shade`, `variant`, etc.
 */
export class ShadeMixerLitElement extends LitElement {
  static rootStyles = (() => {
    const style = css`
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
    `;

    document.adoptedStyleSheets = uniquify([...document.adoptedStyleSheets, style.styleSheet!]);

    return style;
  })();

  static shadedElementStyles = css`
    --tp-element-color: var(--tp-color-primary);
    --tp-shade-attr: attr(shade type(<number>));
    --tp-shade-mixer-type: attr(mixer type(*));
    --tp-shade-mixer-color: if(
      style(--tp-shade-mixer-type: black): var(--tp-color-black);
      else: var(--tp-color-white)
    );
    --tp-shade-mixer-percent: if(
      style(--tp-shade-mixer-type: black): calc(100% - ((var(--tp-shade-attr) - 500) / 500 * 100%));
      else: calc(100% - ((500 - var(--tp-shade-attr)) / 500 * 100%))
    );
    --tp-calc-element-color: color-mix(in xyz, var(--tp-element-color) var(--tp-shade-mixer-percent), var(--tp-shade-mixer-color) calc(100% - var(--tp-shade-mixer-percent)));
    --tp-calc-contrast-color: contrast-color(var(--tp-calc-element-color));
    --tp-contrast-color: if(
      style(--tp-calc-contrast-color: white): var(--tp-color-white);
      else: var(--tp-color-black);
    );

    &[color="contrast"] { --tp-element-color: var(--tp-color-contrast); }
    &[color="primary"] { --tp-element-color: var(--tp-color-primary); }
    &[color="secondary"] { --tp-element-color: var(--tp-color-secondary); }
    &[color="tertiary"] { --tp-element-color: var(--tp-color-tertiary); }
    &[color="quaternary"] { --tp-element-color: var(--tp-color-quaternary); }
    &[color="success"] { --tp-element-color: var(--tp-color-success); }
    &[color="danger"] { --tp-element-color: var(--tp-color-danger); }
    &[color="warning"] { --tp-element-color: var(--tp-color-warning); }
    &[color="neutral"] { --tp-element-color: var(--tp-color-neutral); }
  `;

  @property({ type: String, reflect: true })
  color: PredefinedColors | string = "contrast";

  @property({ type: Number, reflect: true, converter(value, type) {
    const num = Number(value);
    return isNaN(num) ? 500 : minMax(0, 1000, num);
  }})
  shade: number = 500;

  @property({ type: String, reflect: true })
  mixer: ShadeMixerType = "none";

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("shade")) {
      this.mixer = this.shade === 500 ? "none" : this.shade > 500 ? "black" : "white";
    }
  }
}
