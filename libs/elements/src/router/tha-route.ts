import { signal } from "@lit-labs/signals";
import type { URLPattern } from "@thalesrc/extra-ts-types/polyfills/url-pattern";
import { LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export const FRAGMENT = Symbol('ThaRoute:fragment');
export const PATH_PATTERN = Symbol('ThaRoute:path-pattern');

@customElement('tha-route')
export class ThaRoute extends LitElement {
  [FRAGMENT] = signal<WeakRef<DocumentFragment> | null>(this.#getTemplateFragment());
  [PATH_PATTERN]: URLPattern | null = null;

  @property({ type: String })
  path: string | null = null;

  #templateObserver = new MutationObserver(() => {
    this[FRAGMENT].set(this.#getTemplateFragment());
  });

  override connectedCallback(): void {
    super.connectedCallback();

    this.#templateObserver.observe(this, { childList: true });
  }

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'path':
        this[PATH_PATTERN] = value ? new URLPattern({ pathname: value }) : null;
        break;
    }
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
