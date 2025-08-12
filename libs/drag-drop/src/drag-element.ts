import { defer } from "@thalesrc/js-utils/function/defer";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { DropZoneElement } from "./dropzone-element";
import { ACCEPT_DROP_PROP, REGISTER_HANDLE_PROP } from "./private-props";
import { ThaDragEvent } from "./tha-drag-event";
import type { DragHandleElement } from "./drag-handle-element";

declare global {
  interface HTMLElementTagNameMap {
    "tha-drag": DragElement;
  }
}

@customElement('tha-drag')
export class DragElement extends LitElement {
  declare private static TRANSPARENT_IMAGE: HTMLImageElement;
  declare private static GLOBAL_STYLE: HTMLStyleElement;
  private static DRAG_DATA_OBSERVER = new MutationObserver(records => {
    for (const { attributeName, target } of records) {
      if (!attributeName?.startsWith('data-drag-')) continue;

      const element = <DragElement>target;

      element.dragData[attributeName.replace('data-drag-', '')] = element.getAttribute(attributeName)!;
    }
  });

  static override styles = css`
    :host {
      --tha-diff-x: calc(var(--tha-cx) - var(--tha-x));
      --tha-diff-y: calc(var(--tha-cy) - var(--tha-y));
    }

    :host([draggingstrategy="move"]),
    :host([draggingstrategy="copyMove"]) {
      transition-duration: .2s;
      transition-timing-function: ease-out;
      transition-property: none;
    }

    :host([draggingstrategy="move"][dragging]),
    :host([draggingstrategy="copyMove"][dragging]) {
      position: fixed;
      width: var(--tha-width);
      height: var(--tha-height);
      left: calc(var(--tha-left) + var(--tha-diff-x) + var(--tha-offset-x));
      top: calc(var(--tha-top) + var(--tha-diff-y) + var(--tha-offset-y));
      transform-origin: calc(var(--tha-x) - var(--tha-left)) calc(var(--tha-y) - var(--tha-top));
      z-index: 100;
    }

    :host([draggingstrategy="move"][dragend]),
    :host([draggingstrategy="copyMove"][dragend]) {
      left: var(--tha-left);
      top: var(--tha-top);
      transition-property: all;
    }

    :host([draggingstrategy="move"][dragend][dropaccepted]),
    :host([draggingstrategy="copyMove"][dragend][dropaccepted]) {
      left: var(--tha-target-left);
      top: var(--tha-target-top);
      width: var(--tha-target-width);
      height: var(--tha-target-height);
    }
  `;

  static {
    this.TRANSPARENT_IMAGE = new Image(1, 1);
    this.TRANSPARENT_IMAGE.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';

    const style = this.GLOBAL_STYLE = document.createElement('style');

    style.innerHTML = `
      @property --tha-offset-x {
        syntax: '<length>';
        initial-value: 0px;
        inherits: true;
      }

      @property --tha-offset-y {
        syntax: '<length>';
        initial-value: 0px;
        inherits: true;
      }
    `;
    document.head.appendChild(style);
  }

  readonly dragData: Record<string, string> = {};
  readonly preDragData = {
    boundingRect: null! as DOMRect,
    dragStartEvent: null! as DragEvent,
    styles: {
      pointerEvents: ''
    }
  };

  #acceptedDropzone: WeakRef<DropZoneElement> | null = null;
  #clone: WeakRef<HTMLElement> = null!;
  #handles = new WeakSet<DragHandleElement>();

  get clone() { return this.#clone.deref(); }

  @property({ type: String })
  declare name: string;

  @property({ type: String, reflect: true })
  draggingStrategy: 'move' | 'copyMove' = 'move';

  @property({ type: String })
  declare dragGroup: string;

  @property({ type: Boolean })
  declare replaceClone: string;

  @property({ type: Boolean, reflect: true })
  dragging = false;

  @property({ type: Boolean, reflect: true })
  dragend = false;

  @property({ type: String, reflect: true })
  draggedOver: string | null = null;

  @property({ type: Boolean, reflect: true })
  dropAccepted = false;

  override connectedCallback(): void {
    super.connectedCallback();

    this.draggable = true;
    this.#setUpDragDataAttrs();

    this.addEventListener('dragstart', this.#handleDragStart);
    this.addEventListener('dragend', this.#handleDragEnd);
    this.addEventListener('drag', this.#handleDrag);
    this.addEventListener('thadropzoneenter', this.#handleDropZoneEnter);
    this.addEventListener('thadropzoneleave', this.#handleDropZoneLeave);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener('dragstart', this.#handleDragStart);
    this.removeEventListener('dragend', this.#handleDragEnd);
    this.removeEventListener('drag', this.#handleDrag);
    this.removeEventListener('thadropzoneenter', this.#handleDropZoneEnter);
    this.removeEventListener('thadropzoneleave', this.#handleDropZoneLeave);
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  [ACCEPT_DROP_PROP](dropzone: WeakRef<DropZoneElement>, rect?: DOMRect) {
    this.dropAccepted = true;
    this.#acceptedDropzone = dropzone;

    if (!rect) return;

    const { width, height, left, right, top, bottom } = rect;

    for (const prop in { width, height, left, right, top, bottom }) {
      this.style.setProperty(`--tha-target-${prop}`, `${rect[prop as keyof DOMRect]}px`);
    }
  }

  [REGISTER_HANDLE_PROP](handle: WeakRef<DragHandleElement>) {
    this.#handles.add(handle.deref()!);
  }

  #setUpDragDataAttrs() {
    DragElement.DRAG_DATA_OBSERVER.observe(this, { attributes: true });

    for (const { name, value } of Object.values(this.attributes).filter(attr => attr.name.startsWith('data-drag-'))) {
      this.dragData[name.replace('data-drag-', '')] = value;
    }
  }

  #handleDragStart = (event: DragEvent) => {
    event.dataTransfer?.setDragImage(DragElement.TRANSPARENT_IMAGE, 0, 0);
    event.dataTransfer!.effectAllowed = this.draggingStrategy;

    document.addEventListener('dragover', this.#preventDragOver);

    this.#preparePreDragData(event);
    this.#prepareDraggingStyles();

    defer().then(() => {
      this.style.pointerEvents = 'none';
      this.dragging = true;

      if (this.replaceClone) {
        const clone = this.#createClone();

        this.#clone = new WeakRef(clone);
        this.parentElement!.insertBefore(clone, this.nextSibling);
      }

      this.dispatchEvent(new ThaDragEvent('thadragstart', { dragTarget: new WeakRef(this) }, event));
    });
  };

  #handleDragEnd = (event: DragEvent) => {
    document.removeEventListener('dragover', this.#preventDragOver);
    this.dragend = true;

    const hasTransition = getComputedStyle(this).transitionDuration.match(/\d*\.?\d+/g)?.map(Number).some(num => num > 0);
    const clear = () => {
      if (this.replaceClone) this.clone?.remove();

      this.style.pointerEvents = this.preDragData.styles.pointerEvents;
      ['--tha-width', '--tha-height', '--tha-left', '--tha-top', '--tha-x', '--tha-y', '--tha-cx', '--tha-cy'].forEach(prop => {
        this.style.removeProperty(prop);
      });
      ['width', 'height', 'left', 'right', 'top', 'bottom'].forEach(prop => {
        this.style.removeProperty(`--tha-target-${prop}`);
      });

      const acceptedDropzone = this.#acceptedDropzone;
      const dropAccepted = this.dropAccepted;

      this.dragging = false;
      this.dragend = false;
      this.draggedOver = null;
      this.dropAccepted = false;
      this.#acceptedDropzone = null;

      if (dropAccepted && acceptedDropzone) {
        acceptedDropzone.deref()?.dispatchEvent(new ThaDragEvent(
          'thadropend',
          { dragTarget: new WeakRef(this), dropzoneTarget: acceptedDropzone },
          event
        ));
      }

      this.dispatchEvent(new ThaDragEvent('thadragend', { dragTarget: new WeakRef(this) }, event));
    };

    if (hasTransition) this.addEventListener('transitionend', clear, { once: true });
    else clear();
  };

  #handleDrag = (event: DragEvent) => {
    const { x, y } = event;

    this.style.setProperty('--tha-cx', `${x}px`);
    this.style.setProperty('--tha-cy', `${y}px`);
  };

  #handleDropZoneEnter = (event: ThaDragEvent) => {
    this.draggedOver = event.dropzoneTarget?.deref()?.name ?? '';
  };

  #handleDropZoneLeave = () => {
    this.draggedOver = null;
  };

  #createClone() {
    const container = document.createElement('tha-drag-clone');

    Object.values(this.attributes)
      .filter(attr => !['dragging', 'replaceclone', 'draggable'].includes(attr.name))
      .forEach(attr => {
        container.attributes.setNamedItem(attr.cloneNode() as Attr);
      });

    this.childNodes.forEach(node => {
      container.appendChild(node.cloneNode(true));
    });

    return container;
  }

  #preparePreDragData(event: DragEvent) {
    this.preDragData.boundingRect = this.getBoundingClientRect();
    this.preDragData.dragStartEvent = event;
    this.preDragData.styles.pointerEvents = this.style.pointerEvents;
  }

  #prepareDraggingStyles() {
    const {
      boundingRect: { width, height, left, top },
      dragStartEvent: { x, y }
    } = this.preDragData;
    const props = { width, height, left, top, x, y };

    for (const prop in props) {
      this.style.setProperty(`--tha-${prop}`, `${props[prop as keyof typeof props]}px`);
    }
  }

  #preventDragOver(event: DragEvent) {
    event.preventDefault();
  }
}
