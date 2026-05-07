import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ShadeMixerLitElement } from "../utils/shade-mixer-lit-element";

/**
 * Visual treatment applied by `<tp-button>`.
 *
 * - `solid`: filled background using the resolved color.
 * - `outline`: transparent background with a colored border and text; subtle background tint on hover.
 * - `ghost`: like `outline` but without the border &mdash; transparent background with colored text and the same subtle tint on hover.
 * - `text`: no background or border &mdash; just colored text with an underline on hover.
 */
export type ButtonVariant = "solid" | "outline" | "text" | "ghost";

/**
 * Mirrors the native HTML `<button>` `type` attribute.
 *
 * - `button`: no implicit form behaviour (default).
 * - `submit`: clicks/Enter call `form.requestSubmit()` on the associated form.
 * - `reset`: clicks/Enter call `form.reset()` on the associated form.
 */
export type ButtonType = "button" | "submit" | "reset";

declare global {
  interface HTMLElementTagNameMap {
    "tp-button": ButtonElement;
  }
}

/**
 * `<tp-button>` &mdash; framework-agnostic, form-associated button.
 *
 * Behaves like the native `<button>` element:
 *
 * - Participates in the tab order (`tabindex="0"` on connect; `-1` while disabled).
 * - Activates on `Space` / `Enter`.
 * - With `type="submit"` calls `form.requestSubmit()`; with `type="reset"` calls `form.reset()`.
 * - When `disabled`, blocks click and keyboard activation and updates `aria-disabled`.
 * - Announces `role="button"` to assistive technology via `ElementInternals`.
 *
 * Color is supplied through {@link ShadeMixerLitElement}: pick a palette token via `color`,
 * then lighten or darken it through `shade` (`0`&ndash;`1000`, `500` is the base color).
 * The element renders into the **light DOM** so global CSS, Tailwind utilities, and consumer
 * tokens apply directly.
 *
 * @element tp-button
 *
 * @attr {"solid" | "outline" | "ghost" | "text"} [variant="solid"] - Visual treatment.
 * @attr {"button" | "submit" | "reset"} [type="button"] - Native button semantics.
 * @attr {boolean} [disabled=false] - Disables interaction and removes the button from the tab order.
 * @attr {string} [color="contrast"] - Palette token (`primary`, `secondary`, `success`, &hellip;) inherited from {@link ShadeMixerLitElement}.
 * @attr {number} [shade=500] - Shade between `0` (lightest) and `1000` (darkest); `500` is the base color.
 * @attr {"none" | "black" | "white"} [mixer="none"] - Auto-derived from `shade` (read-only output).
 *
 * @cssprop --tp-button-color - Resolved background/text color (defaults to the calculated palette color).
 * @cssprop --tp-button-contrast-color - Resolved contrast color used for `solid` text.
 *
 * @example
 * ```html
 * <tp-button>Click me</tp-button>
 * <tp-button variant="outline" color="success">Save</tp-button>
 * <tp-button variant="text" color="danger" disabled>Delete</tp-button>
 *
 * <form>
 *   <input name="email" type="email" />
 *   <tp-button type="submit" color="primary">Subscribe</tp-button>
 * </form>
 * ```
 */
@customElement("tp-button")
export class ButtonElement extends ShadeMixerLitElement {
  /** Marks the element as form-associated so `attachInternals().form` is populated. */
  static formAssociated = true;
  static override styles = (() => {
    const style = css`
      @layer base {
        tp-button {
          ${ShadeMixerLitElement.shadedElementStyles}
          --tp-button-color: var(--tp-calc-element-color);
          --tp-button-contrast-color: var(--tp-calc-contrast-color);
          display: inline-block;
          border: 1px solid transparent;
          cursor: pointer;
          outline-offset: 1em;
          outline: 1px solid transparent;
          transform: scale(1);
          transition: all 0.18s ease;
          transition-property: background-color, color, outline-color, outline-offset, transform, border-width;

          &:active {
            transform: scale(0.98);
          }

          &:not(:active):focus {
            outline-color: var(--tp-button-color);
            outline-offset: 2px;
          }

          &[disabled] {
            --tp-button-color: color-mix(in xyz, var(--tp-calc-element-color) 50%, var(--tp-color-white) 50%);
            --tp-button-contrast-color: rgb(from var(--tp-calc-contrast-color) r g b / 50%);
            pointer-events: none;
            user-select: none;
            cursor: not-allowed;
          }

          &[variant="solid"],
          &[variant="outline"],
          &[variant="ghost"] {
            padding-inline: 1em;
            padding-block: 0.5em;
          }

          &[variant="outline"],
          &[variant="ghost"] {
            color: var(--tp-button-color);
            background-color: transparent;

            &:hover {
              background-color: color-mix(in xyz, var(--tp-button-color) 10%, transparent 90%);
            }
          }

          &[variant="solid"] {
            background-color: var(--tp-button-color);
            color: var(--tp-button-contrast-color);

            &:hover {
              background-color: color-mix(in xyz, var(--tp-button-color) 80%, var(--tp-color-black) 20%);
            }
          }

          &[variant="outline"] {
            border-color: var(--tp-button-color);

            &:focus-visible {
              outline-color: transparent;
            }
          }

          &[variant="text"] {
            color: var(--tp-button-color);
            background-color: transparent;

            &:hover {
              color: color-mix(in xyz, var(--tp-button-color) 80%, var(--tp-color-black) 20%);
              text-decoration: underline;
            }
          }
        }
      }
    `;

    document.adoptedStyleSheets = [...document.adoptedStyleSheets, style.styleSheet!];

    return style;
  })();

  @property({ type: String, reflect: true })
  variant: ButtonVariant = "solid";

  /**
   * Native button semantics. Determines what happens to the associated form when
   * the button is activated. `submit` calls `form.requestSubmit()`, `reset` calls
   * `form.reset()`, and `button` (the default) does nothing implicit.
   */
  @property({ type: String, reflect: true })
  type: ButtonType = "button";

  /**
   * When `true`, the button is removed from the tab order, click and keyboard
   * activation are blocked, and `aria-disabled` is set on the element internals.
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  readonly #internals: ElementInternals;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = "button";
  }

  /** The form this button is associated with, if any. Mirrors `HTMLButtonElement.form`. */
  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", this.disabled ? "-1" : "0");
    }
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
  }

  protected override updated(changed: Map<string, unknown>): void {
    super.updated?.(changed);
    if (changed.has("disabled")) {
      this.setAttribute("tabindex", this.disabled ? "-1" : "0");
      this.#internals.ariaDisabled = this.disabled ? "true" : "false";
    }
  }

  #handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const form = this.#internals.form;
    if (!form) return;
    if (this.type === "submit") {
      form.requestSubmit();
    } else if (this.type === "reset") {
      form.reset();
    }
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this.click();
    }
  };

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    return html``;
  }
}
