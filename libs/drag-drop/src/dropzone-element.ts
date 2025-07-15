import { CSSResultGroup, LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { DragElementEventTypes, DropElementEventTypes, TMDragEvent } from "./tm-drag-event";

declare global {
  interface HTMLElementTagNameMap {
    "tm-dropzone": DropZoneElement;
  }
}

let LAST_DRAG_EVENT: TMDragEvent;

document.addEventListener('tmdragstart', event => {
  LAST_DRAG_EVENT = event;
});

@customElement('tm-dropzone')
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

  protected override render() {
    return html`<slot></slot>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    document.addEventListener('tmdragstart', this.#handleGlobalDragStart);
    document.addEventListener('tmdragend', this.#handleGlobalDragEnd);
    document.addEventListener('tmdropend', this.#handleGlobalDragEnd);
    this.addEventListener('dragenter', this.#handleDragEnter);
    this.addEventListener('dragleave', this.#handleDragLeave);
    this.addEventListener('dragover', this.#handleDragOver);
    this.addEventListener('drop', this.#handleDrop);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    document.removeEventListener('tmdragstart', this.#handleGlobalDragStart);
    document.removeEventListener('tmdragend', this.#handleGlobalDragEnd);
    document.removeEventListener('tmdropend', this.#handleGlobalDragEnd);
    this.removeEventListener('dragenter', this.#handleDragEnter);
    this.removeEventListener('dragleave', this.#handleDragLeave);
    this.removeEventListener('dragover', this.#handleDragOver);
    this.removeEventListener('drop', this.#handleDrop);
  }

  #handleGlobalDragStart = (event: TMDragEvent) => {
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
    this.#dispatchEventWithCounter('tmdragenter', 'tmdropzoneenter', event);
  };

  #handleDragLeave = (event: DragEvent) => {
    if (!this.#isAcceptableDrag()) return;

    if (--this.#enterCount > 0) return;

    this.itemDragged = null;
    this.#dispatchEventWithCounter('tmdragleave', 'tmdropzoneleave', event);
  };

  #handleDragOver = (event: DragEvent) => {
    if (!this.#isAcceptableDrag()) return;

    this.#dispatchEventWithCounter('tmdragover', 'tmdropzoneover', event);
  };

  #handleDrop = (event: DragEvent) => {
    if (!this.#isAcceptableDrag()) return;

    this.#dispatchEventWithCounter('tmdrop', 'tmdropped', event);
  };

  #isAcceptableDrag(): boolean {
    return !LAST_DRAG_EVENT.name || !this.accept.length || this.accept.includes(LAST_DRAG_EVENT.name!);
  }

  #dispatchEventWithCounter(eventName: DropElementEventTypes, counterEventName: DragElementEventTypes, event: DragEvent) {
    const { dragTarget } = LAST_DRAG_EVENT;
    const dropzoneTarget = new WeakRef(this);

    this.dispatchEvent(new TMDragEvent(eventName, { dragTarget, dropzoneTarget }, event));
    dragTarget.deref()?.dispatchEvent(new TMDragEvent(counterEventName, { dragTarget, dropzoneTarget }, event));
  }
}
