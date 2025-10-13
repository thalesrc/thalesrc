import { CSSResultGroup, LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { DragElementEventTypes, DropElementEventTypes, ThaDragEvent } from "./tha-drag-event";

declare global {
  interface HTMLElementTagNameMap {
    "tha-dropzone": DropZoneElement;
  }
}

let LAST_DRAG_EVENT: ThaDragEvent;

document.addEventListener('thadragstart', event => {
  LAST_DRAG_EVENT = event;
});

@customElement('tha-dropzone')
export class DropZoneElement extends LitElement {
  static override styles?: CSSResultGroup = css``;

  #enterCount = 0;

  @property({ converter: value => (value ?? '').split(',').map(str => str.trim()) })
  accept: string[] = [];

  @property({ type: String })
  name = '';

  @property({ type: String, reflect: true })
  itemDragged: string | null = null;

  @property({ type: Boolean, reflect: true })
  acceptableDrag = false;

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    document.addEventListener('thadragstart', this.#handleGlobalDragStart);
    document.addEventListener('thadragend', this.#handleGlobalDragEnd);
    document.addEventListener('thadropend', this.#handleGlobalDragEnd);
    this.addEventListener('dragenter', this.#handleDragEnter);
    this.addEventListener('dragleave', this.#handleDragLeave);
    this.addEventListener('dragover', this.#handleDragOver);
    this.addEventListener('drop', this.#handleDrop);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    document.removeEventListener('thadragstart', this.#handleGlobalDragStart);
    document.removeEventListener('thadragend', this.#handleGlobalDragEnd);
    document.removeEventListener('thadropend', this.#handleGlobalDragEnd);
    this.removeEventListener('dragenter', this.#handleDragEnter);
    this.removeEventListener('dragleave', this.#handleDragLeave);
    this.removeEventListener('dragover', this.#handleDragOver);
    this.removeEventListener('drop', this.#handleDrop);
  }

  #handleGlobalDragStart = (event: ThaDragEvent) => {
    if (!this.accept.length || this.accept.includes(event.name!)) {
      this.acceptableDrag = true;
    }
  };

  #handleGlobalDragEnd = () => {
    this.itemDragged = null;
    this.acceptableDrag = false;
    this.#enterCount = 0;
  };

  #handleDragEnter = (event: DragEvent) => {
    if (!this.#isAcceptableDrag()) return;

    if (++this.#enterCount > 1) return;

    this.itemDragged = LAST_DRAG_EVENT.name ?? '';
    this.#dispatchEventWithCounter('thadragenter', 'thadropzoneenter', event);
  };

  #handleDragLeave = (event: DragEvent) => {
    if (!this.#isAcceptableDrag()) return;

    if (--this.#enterCount > 0) return;

    this.itemDragged = null;
    this.#dispatchEventWithCounter('thadragleave', 'thadropzoneleave', event);
  };

  #handleDragOver = (event: DragEvent) => {
    if (!this.#isAcceptableDrag()) return;

    this.#dispatchEventWithCounter('thadragover', 'thadropzoneover', event);
  };

  #handleDrop = (event: DragEvent) => {
    if (!this.#isAcceptableDrag()) return;

    this.#dispatchEventWithCounter('thadrop', 'thadropped', event);
  };

  #isAcceptableDrag(): boolean {
    return !LAST_DRAG_EVENT.name || !this.accept.length || this.accept.includes(LAST_DRAG_EVENT.name!);
  }

  #dispatchEventWithCounter(eventName: DropElementEventTypes, counterEventName: DragElementEventTypes, event: DragEvent) {
    const { dragTarget } = LAST_DRAG_EVENT;
    const dropzoneTarget = new WeakRef(this);

    this.dispatchEvent(new ThaDragEvent(eventName, { dragTarget, dropzoneTarget }, event));
    dragTarget.deref()?.dispatchEvent(new ThaDragEvent(counterEventName, { dragTarget, dropzoneTarget }, event));
  }
}
