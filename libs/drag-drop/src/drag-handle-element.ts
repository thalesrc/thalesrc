import { getParents } from "@thalesrc/dom-utils/get-parents";
import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { DragElement } from "./drag-element";
import { REGISTER_HANDLE_PROP, UNREGISTER_HANDLE_PROP } from "./private-props";

declare global {
  interface HTMLElementTagNameMap {
    "tha-drag-handle": DragHandleElement;
  }
}

@customElement("tha-drag-handle")
export class DragHandleElement extends LitElement {
  get #parent(): DragElement | null {
    for (const parent of getParents(this)) {
      if (parent instanceof DragElement) {
        return parent;
      }
    }

    return null;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.draggable = true;
    this.#parent?.[REGISTER_HANDLE_PROP](this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#parent?.[UNREGISTER_HANDLE_PROP](this);
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}
