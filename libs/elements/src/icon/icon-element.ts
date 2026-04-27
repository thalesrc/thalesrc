import { LitElement, html } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A framework-agnostic icon element backed by Material Symbols.
     *
     * Renders into the **light DOM** so the host's utility classes are styled by the consumer's
     * Tailwind v4 build. Required attribute-driven CSS (font-family, font-variation-settings,
     * `attr(... type(<number>))` rules) is injected once into `document.head` by the element class.
     *
     * Pick icons from https://fonts.google.com/icons
     *
     * @example
     * ```html
     * <tp-icon>home</tp-icon>
     * <tp-icon family="material" variant="round" filled grade="200" weight="700" optical-size="48">favorite</tp-icon>
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
    `;
    document.head.appendChild(style);
  }

  /** Icon family. Currently only Material Symbols is supported. */
  @property({ reflect: true })
  family: "material" = "material";

  /** Material Symbols variant. */
  @property({ reflect: true })
  variant: "outlined" | "round" | "sharp" = "outlined";

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

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.classList.add(...HOST_CLASSES);
  }

  protected override render(): TemplateResult {
    return html``;
  }
}
