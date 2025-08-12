import { LitElement } from "lit";
import { customElement } from "lit/decorators";
import { DragElement } from "./drag-element";
import { REGISTER_HANDLE_PROP } from "./private-props";

@customElement("tha-drag-handle")
export class DragHandleElement extends LitElement {
  override connectedCallback(): void {
    super.connectedCallback();

    const parent = this.#getParent();

    if (!parent) return;

    parent[REGISTER_HANDLE_PROP](new WeakRef(this));
  }

  #getParent(): DragElement | null {
    let parent: HTMLElement | null = this.parentElement;

    while (parent) {
      if (parent instanceof DragElement) {
        return parent;
      }
      parent = parent.parentElement;

      if (parent instanceof HTMLHtmlElement || parent instanceof Window) {
        break;
      }
    }

    return null;
  }
}
