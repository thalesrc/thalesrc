import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { noop } from "@telperion/js-utils/function/noop";

import { REGISTER_OPTION, SHOULD_REGISTER_TO_SELECT, UNREGISTER_OPTION } from "./internal-props";
import { selectContext } from "./select-context";
import type { SelectElement } from "./select.element";
import { SignalWatcherLitElement } from "../utils/signal-watcher-lit-element";

declare global {
  interface HTMLElementTagNameMap {
    "tp-option": OptionElement;
  }
}

@customElement("tp-option")
export class OptionElement extends SignalWatcherLitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  #selectedUnsubscriber = noop;

  @consume({ context: selectContext, subscribe: true })
  @state()
  private select?: SelectElement;

  [SHOULD_REGISTER_TO_SELECT] = true;

  @property({ type: String, reflect: true })
  value = "";

  #selected = false;

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this[SHOULD_REGISTER_TO_SELECT]) return;

    this.select?.[REGISTER_OPTION](this);

    this.#selectedUnsubscriber = this.updateEffect(() => {
      const next = this.select?.selectedOptions.get()
          .some((ref) => ref.deref() === this) ?? false;

      if (next === this.#selected) return;

      this.#selected = next;
      this.toggleAttribute("selected", next);
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    if (!this[SHOULD_REGISTER_TO_SELECT]) return;

    this.select?.[UNREGISTER_OPTION](this);
    this.#selectedUnsubscriber();
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}
