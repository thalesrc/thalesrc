import { signal } from "@lit-labs/signals";
import { LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

export const FRAGMENT = Symbol('ThaRoute:fragment');

@customElement('tha-route')
export class ThaRoute extends LitElement {
  [FRAGMENT] = signal<WeakRef<DocumentFragment> | null>(this.#getTemplateFragment());

  #templateObserver = new MutationObserver(() => {
    this[FRAGMENT].set(this.#getTemplateFragment());
  });

  override connectedCallback(): void {
    super.connectedCallback();

    this.#templateObserver.observe(this, { childList: true });

  }

  #getTemplateFragment(): WeakRef<DocumentFragment> | null {
    const template = this.querySelector('template');

    return template ? new WeakRef(template.content) : null;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#templateObserver.disconnect();
  }
}
