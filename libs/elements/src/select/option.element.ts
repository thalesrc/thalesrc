import { css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";

import { REGISTER_OPTION, SHOULD_REGISTER_TO_SELECT, UNREGISTER_OPTION } from "./internal-props";
import { selectContext } from "./select-context";
import type { SelectElement } from "./select.element";
import { SignalWatcherLitElement } from "../utils/signal-watcher-lit-element";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A single selectable item inside a `<tp-select>`.
     *
     * Discovers its host `<tp-select>` via `@lit/context`, registers itself
     * on connect, and reflects its own selected state through the
     * `selected` attribute (read-only — set selection by clicking, by
     * mutating `tp-select.value`, or by calling
     * `selectOption()`/`deselectOption()`/`toggleOption()` on the host).
     *
     * @example
     * ```html
     * <tp-select>
     *   <tp-option value="apple">Apple</tp-option>
     *   <tp-option value="banana">Banana</tp-option>
     * </tp-select>
     * ```
     *
     * @attr value    - The submitted value when this option is selected.
     * @attr selected - Reflects current selection state (do not set manually).
     *
     * @slot - Visible label for the option.
     */
    "tp-option": OptionElement;
  }
}

@customElement("tp-option")
export class OptionElement extends SignalWatcherLitElement {
  static styles = (() => {
    const style = css`
      tp-option:not([part="selected-content-option"]) {
        display: block;
        cursor: pointer;
        background: var(--tp-select-option-color, white);

        &:hover {
          background: color-mix(in xyz, var(--tp-select-option-color, white) calc(100% - var(--tp-select-highlight-percent, 20%)), black var(--tp-select-highlight-percent, 20%));
        }

        &[selected] {
          background: var(--tp-select-selection-color, #0078d4);
          color: var(--tp-select-selection-contrast-color, white);

          &:hover {
            background: color-mix(in xyz, var(--tp-select-selection-color, #0078d4) calc(100% - var(--tp-select-highlight-percent, 20%)), black var(--tp-select-highlight-percent, 20%));
          }
        }
      }
    `;

    document.adoptedStyleSheets = [...document.adoptedStyleSheets, style.styleSheet!];

    return style;
  })();

  @consume({ context: selectContext, subscribe: true })
  @state()
  private select?: SelectElement;

  [SHOULD_REGISTER_TO_SELECT] = true;

  @property({ type: String, reflect: true })
  value = "";

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this[SHOULD_REGISTER_TO_SELECT]) return;

    this.select?.[REGISTER_OPTION](this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    if (!this[SHOULD_REGISTER_TO_SELECT]) return;

    this.select?.[UNREGISTER_OPTION](this);
  }

  /**
   * Reflect `selected` state by reading the parent's signal during the
   * normal Lit update. `SignalWatcher` auto-tracks signal access here, so
   * the option will re-render whenever the selection changes — without
   * the disposal-race that `updateEffect` exposes.
   */
  protected override willUpdate(_changed: PropertyValues): void {
    if (!this[SHOULD_REGISTER_TO_SELECT]) return;

    const next = this.select?.selectedOptions
      .get()
      .some((ref) => ref.deref() === this) ?? false;

    this.toggleAttribute("selected", next);
  }

  protected override createRenderRoot() {
    return this;
  }

  protected override render() {
    return html``;
  }
}
