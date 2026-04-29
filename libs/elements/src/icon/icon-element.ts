import { LitElement, html } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  getSimpleIconSymbolId,
  loadSimpleIcon,
} from "./simple-icons-sprite";
import {
  getTheSvgSymbolId,
  loadTheSvgIcon,
} from "./thesvg-sprite";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A framework-agnostic icon element. Supports two families:
     *
     * - `material` (default) &mdash; Material Symbols glyphs via font ligatures.
     *   Pick icons from https://fonts.google.com/icons.
     * - `simple-icons` &mdash; brand icons from https://simpleicons.org via
     *   `<tp-icon family="simple-icons" slug="facebook">`.
     * - `thesvg` &mdash; multi-color brand icons from https://thesvg.org via
     *   `<tp-icon family="thesvg" slug="google" variant="mono">`.
     *
     * Renders into the **light DOM** so the host's utility classes are styled by
     * the consumer's Tailwind v4 build.
     *
     * @example
     * ```html
     * <tp-icon>home</tp-icon>
     * <tp-icon family="material" variant="round" filled>favorite</tp-icon>
     * <tp-icon family="simple-icons" slug="facebook" style="color:#1877F2"></tp-icon>
     * ```
     */
    "tp-icon": IconElement;
  }
}

const HOST_CLASSES = [
  "font-normal",
  "not-italic",
  "text-2xl",
  "leading-none",
  "normal-case",
  "tracking-normal",
  "inline-block",
  "whitespace-nowrap",
  "select-none",
];

@customElement("tp-icon")
export class IconElement extends LitElement {
  declare private static GLOBAL_STYLE: HTMLStyleElement;

  static {
    const style = (this.GLOBAL_STYLE = document.createElement("style"));

    style.textContent = `
      tp-icon[family="material"] {
        font-family: 'Material Symbols Outlined';
        font-variation-settings:
          'FILL' var(--tp-icon-fill, 0),
          'wght' var(--tp-icon-weight, 400),
          'GRAD' var(--tp-icon-grade, 0),
          'opsz' var(--tp-icon-opsz, 24);
        word-wrap: normal;
        direction: ltr;
        font-feature-settings: 'liga';
        -webkit-font-smoothing: antialiased;
      }

      tp-icon[family="material"][variant="round"] {
        font-family: 'Material Symbols Rounded';
      }

      tp-icon[family="material"][variant="sharp"] {
        font-family: 'Material Symbols Sharp';
      }

      tp-icon[filled] {
        --tp-icon-fill: 1;
      }

      tp-icon[grade] {
        --tp-icon-grade: attr(grade type(<number>));
      }

      tp-icon[weight] {
        --tp-icon-weight: attr(weight type(<number>));
      }

      tp-icon[optical-size] {
        --tp-icon-opsz: attr(optical-size type(<number>));
      }

      tp-icon[family="simple-icons"] > svg {
        width: 1em;
        height: 1em;
        fill: currentColor;
        vertical-align: -0.125em;
      }

      tp-icon[family="thesvg"] > svg {
        height: 1em;
        width: auto;
        vertical-align: -0.125em;
      }
    `;
    document.head.appendChild(style);
  }

  /** Icon family. */
  @property({ reflect: true })
  family: "material" | "simple-icons" | "thesvg" = "material";

  /**
   * Icon variant. Per-family interpretation:
   * - `material`: `"outlined" | "round" | "sharp"` (default `"outlined"`).
   * - `thesvg`: any theSVG variant slug, e.g. `"default"`, `"mono"`,
   *   `"wordmark"`. Defaults to `"default"` when no `variant` attribute is set.
   */
  @property({ reflect: true })
  variant: string = "outlined";

  /** Whether the glyph should be filled (FILL axis = 1). */
  @property({ type: Boolean, reflect: true })
  filled = false;

  /** Material Symbols GRAD axis (-25..200). */
  @property({ type: Number, reflect: true })
  grade = 0;

  /** Material Symbols wght axis (100..700). */
  @property({ type: Number, reflect: true })
  weight = 400;

  /** Material Symbols opsz axis (20..48). Reflects as `optical-size` attribute. */
  @property({ type: Number, reflect: true, attribute: "optical-size" })
  opticalSize = 24;

  /** Slug for `simple-icons` and `thesvg` families. */
  @property({ reflect: true })
  slug?: string;

  /** Reflected while a remote icon (Simple Icons / theSVG) is being fetched. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Reflected when the most recent remote-icon fetch failed. */
  @property({ type: Boolean, reflect: true })
  errored = false;

  #requestToken: symbol | null = null;
  #injected: SVGSVGElement | null = null;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.classList.add(...HOST_CLASSES);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      !changed.has("family") &&
      !changed.has("slug") &&
      !changed.has("variant")
    ) return;

    if (this.family === "simple-icons") {
      if (this.slug) {
        void this.#renderSimpleIcon(this.slug);
      } else {
        this.#clearRemoteIcon();
      }
    } else if (this.family === "thesvg") {
      if (this.slug) {
        void this.#renderTheSvg(this.slug, this.#theSvgVariant());
      } else {
        this.#clearRemoteIcon();
      }
    } else if (changed.has("family")) {
      this.#clearRemoteIcon();
    }
  }

  #theSvgVariant(): string {
    // The `variant` property defaults to `"outlined"` (a Material value).
    // Only forward it to theSVG if the consumer set the attribute explicitly;
    // otherwise fall back to theSVG's `"default"` variant.
    return this.hasAttribute("variant") ? this.variant : "default";
  }

  protected override render(): TemplateResult {
    return html``;
  }

  async #renderSimpleIcon(slug: string): Promise<void> {
    const token = (this.#requestToken = Symbol("tp-icon-request"));
    const consumerLabel = this.hasAttribute("aria-label");

    this.loading = true;
    this.errored = false;

    // Insert the <use> reference immediately. If the symbol is already in the
    // sprite the browser paints without flicker; otherwise it lights up the
    // moment the symbol lands.
    this.#removeInjected();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${getSimpleIconSymbolId(slug)}`);
    svg.appendChild(use);
    this.appendChild(svg);
    this.#injected = svg;

    try {
      const meta = await loadSimpleIcon(slug);
      if (this.#requestToken !== token) return;

      this.loading = false;
      if (!consumerLabel) {
        this.setAttribute("aria-label", meta.title);
        svg.removeAttribute("aria-hidden");
      }

      this.dispatchEvent(
        new CustomEvent("tp-icon-load", {
          bubbles: true,
          composed: true,
          detail: { slug, title: meta.title },
        }),
      );
    } catch (error) {
      if (this.#requestToken !== token) return;

      this.loading = false;
      this.errored = true;
      this.#removeInjected();

      this.dispatchEvent(
        new CustomEvent("tp-icon-error", {
          bubbles: true,
          composed: true,
          detail: { slug, error },
        }),
      );
    }
  }

  async #renderTheSvg(slug: string, variant: string): Promise<void> {
    const token = (this.#requestToken = Symbol("tp-icon-request"));

    this.loading = true;
    this.errored = false;

    // Insert the <use> reference immediately so the symbol paints without
    // flicker once it lands in the sprite.
    this.#removeInjected();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${getTheSvgSymbolId(slug, variant)}`);
    svg.appendChild(use);
    this.appendChild(svg);
    this.#injected = svg;

    try {
      const meta = await loadTheSvgIcon(slug, variant);
      if (this.#requestToken !== token) return;

      // Mirror the symbol's viewBox onto the outer <svg> so it has an
      // intrinsic aspect ratio. Without this, `width: auto` from CSS falls
      // back to the SVG default of 300x150 instead of being derived from
      // `height: 1em` × the icon's own aspect ratio.
      svg.setAttribute("viewBox", meta.viewBox);

      this.loading = false;

      this.dispatchEvent(
        new CustomEvent("tp-icon-load", {
          bubbles: true,
          composed: true,
          detail: { slug, variant, viewBox: meta.viewBox },
        }),
      );
    } catch (error) {
      if (this.#requestToken !== token) return;

      this.loading = false;
      this.errored = true;
      this.#removeInjected();

      this.dispatchEvent(
        new CustomEvent("tp-icon-error", {
          bubbles: true,
          composed: true,
          detail: { slug, variant, error },
        }),
      );
    }
  }

  #clearRemoteIcon(): void {
    this.#requestToken = null;
    this.loading = false;
    this.errored = false;
    this.#removeInjected();
  }

  #removeInjected(): void {
    if (this.#injected && this.#injected.parentNode === this) {
      this.removeChild(this.#injected);
    }
    this.#injected = null;
  }
}
