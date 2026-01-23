import { defer } from "@thalesrc/js-utils/function/defer";
import { LitElement, css, html, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { DropZoneElement } from "./dropzone-element";
import { ACCEPT_DROP_PROP, REGISTER_HANDLE_PROP, UNREGISTER_HANDLE_PROP } from "./private-props";
import { ThaDragEvent } from "./tha-drag-event";
import type { DragHandleElement } from "./drag-handle-element";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A draggable element that can be used to initiate drag-and-drop operations.
     * It can contain child elements and supports drag handles.
     * The `replaceclone` attribute indicates whether the element should be replaced with a clone during
     * the drag operation.
     * The `draggingstrategy` attribute defines the drag behavior, such as 'move' or 'copyMove'.
     *
     */
    "tha-drag": DragElement;
  }
}

@customElement('tha-drag')
export class DragElement extends LitElement {
  /**
   * A transparent image used as a drag image to prevent flickering during drag operations.
   * This image is used when the drag image is not set explicitly.
   * It is a 1x1 pixel transparent PNG.
   */
  declare private static TRANSPARENT_IMAGE: HTMLImageElement;

  /**
   * A global style element used to define custom properties for drag-and-drop.
   */
  declare private static GLOBAL_STYLE: HTMLStyleElement;

  /**
   * An observer for monitoring changes to drag-related attributes.
   */
  private static DRAG_DATA_OBSERVER = new MutationObserver(records => {
    for (const { attributeName, target } of records) {
      if (!attributeName?.startsWith('data-drag-')) continue;

      const element = <DragElement>target;

      element.dragData[attributeName.replace('data-drag-', '')] = element.getAttribute(attributeName)!;
    }
  });

  static override styles: CSSResultGroup = css`
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

  /**
   * A record of drag-related data attributes.
   */
  readonly dragData: Record<string, string> = {};

  /**
   * Pre-drag data used to store the initial state of the element before dragging starts.
   */
  readonly preDragData = {
    boundingRect: null! as DOMRect,
    dragStartEvent: null! as DragEvent,
    styles: {
      pointerEvents: ''
    }
  };

  /**
   * A weak reference to the currently accepted drop zone.
   * This is used to track which drop zone the element is currently accepted in.
   */
  #acceptedDropzone: WeakRef<DropZoneElement> | null = null;

  /**
   * A weak reference to the clone of the element created during dragging.
   * This is used to manage the clone's lifecycle and properties.
   */
  #clone: WeakRef<HTMLElement> = null!;

  /**
   * A set of drag handles associated with the element.
   */
  #handles = new Set<DragHandleElement>();

  /**
   * Returns the clone of the element if it exists.
   * This is used to access the clone during drag operations.
   */
  get clone() { return this.#clone.deref(); }

  /**
   * The name of the element, used for identification in drag-and-drop operations.
   * This helps the dropzones to accept or reject the drag based on the name.
   */
  @property({ type: String })
  declare name: string;

  /**
   * The dragging strategy to use for the element.
   * This determines how the element is dragged (e.g., move or copy).
   */
  @property({ type: String, reflect: true })
  draggingStrategy: 'move' | 'copyMove' = 'move';

  /**
   * The group name for the drag element.
   * This is used to group elements together for drag-and-drop operations.
   * Elements with the same group name can interact with each other during drag-and-drop.
   *
   * !!! Not implemented yet !!!
   */
  @property({ type: String })
  declare dragGroup: string;

  /**
   * Indicates whether the element should replace its clone during drag operations.
   * If true , the original element is replaced with a clone during dragging.
   */
  @property({ type: Boolean })
  declare replaceClone: boolean;

  /**
   * Indicates whether the element is currently being dragged.
   */
  @property({ type: Boolean, reflect: true })
  dragging = false;

  /**
   * Indicates whether the drag operation has ended.
   * This is used to manage the state of the element after dragging.
   */
  @property({ type: Boolean, reflect: true })
  dragend = false;

  /**
   * The ID of the drop zone the element is currently over.
   */
  @property({ type: String, reflect: true })
  draggedOver: string | null = null;

  /**
   * Indicates whether the element has been accepted by a drop zone.
   * This is used to manage the state of the element during drag-and-drop operations.
   */
  @property({ type: Boolean, reflect: true })
  dropAccepted = false;

  /**
   * Indicates whether the drag element is disabled.
   * When disabled, the element cannot be dragged.
   */
  @property({ type: Boolean, reflect: true })
  declare disabled: boolean;

  override connectedCallback(): void {
    super.connectedCallback();

    // Set the draggable attribute to true to enable dragging.
    this.draggable = true;

    // Set up the drag data attributes observer to monitor changes to drag-related attributes.
    this.#setUpDragDataAttrs();

    // Add event listeners for drag events.
    this.addEventListener('dragstart', this.#handleDragStart);
    this.addEventListener('dragend', this.#handleDragEnd);
    this.addEventListener('drag', this.#handleDrag);
    this.addEventListener('thadropzoneenter', this.#handleDropZoneEnter);
    this.addEventListener('thadropzoneleave', this.#handleDropZoneLeave);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    // Clean up the drag data attributes observer.
    this.removeEventListener('dragstart', this.#handleDragStart);
    this.removeEventListener('dragend', this.#handleDragEnd);
    this.removeEventListener('drag', this.#handleDrag);
    this.removeEventListener('thadropzoneenter', this.#handleDropZoneEnter);
    this.removeEventListener('thadropzoneleave', this.#handleDropZoneLeave);
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }

  /**
   * Accepts a drop zone and an optional rectangle for the drop area.
   * @param dropzone The drop zone element being accepted.
   * @param rect The bounding rectangle of the drop area.
   * @returns
   */
  [ACCEPT_DROP_PROP](dropzone: WeakRef<DropZoneElement>, rect?: DOMRect) {
    this.dropAccepted = true;
    this.#acceptedDropzone = dropzone;

    if (!rect) return;

    const { width, height, left, right, top, bottom } = rect;

    for (const prop in { width, height, left, right, top, bottom }) {
      this.style.setProperty(`--tha-target-${prop}`, `${rect[prop as keyof DOMRect]}px`);
    }
  }

  /**
   * Registers a drag handle element.
   * @param handle The drag handle element to register.
   */
  [REGISTER_HANDLE_PROP](handle: DragHandleElement) {
    this.#handles.add(handle);
  }

  /**
   * Unregisters a drag handle element.
   * @param handle The drag handle element to unregister.
   */
  [UNREGISTER_HANDLE_PROP](handle: DragHandleElement) {
    this.#handles.delete(handle);
  }

  /**
   * Sets up the drag data attributes observer to monitor changes to drag-related attributes.
   * This allows the element to transfer custom data during drag-and-drop operations.
   */
  #setUpDragDataAttrs() {
    DragElement.DRAG_DATA_OBSERVER.observe(this, { attributes: true });

    for (const { name, value } of Object.values(this.attributes).filter(attr => attr.name.startsWith('data-drag-'))) {
      this.dragData[name.replace('data-drag-', '')] = value;
    }
  }

  /**
   * Handles the drag start event.
   * @param event The drag event.
   */
  #handleDragStart = (event: DragEvent) => {
    if (!this.#shouldHandleEvent(event)) return event.preventDefault();

    // Stop propagation to prevent parent draggable elements from interfering.
    event.stopPropagation();

    // Modify base event properties to prevent default behavior and set up drag image.
    event.dataTransfer?.setDragImage(DragElement.TRANSPARENT_IMAGE, 0, 0);
    event.dataTransfer!.effectAllowed = this.draggingStrategy;

    document.addEventListener('dragover', this.#preventDragOver);

    // Prepare pre-drag data and styles.
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

  /**
   * Handles the drag end event.
   * @param event The drag event.
   */
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

  /**
   * Handles the drag event.
   * This updates the position of the element during dragging.
   * @param event The drag event.
   */
  #handleDrag = (event: DragEvent) => {
    const { x, y } = event;

    this.style.setProperty('--tha-cx', `${x}px`);
    this.style.setProperty('--tha-cy', `${y}px`);
  };

  /**
   * Handles the drop zone enter event.
   * This updates the draggedOver property to indicate which drop zone the element is currently over.
   * @param event The ThaDragEvent for the drop zone enter.
   */
  #handleDropZoneEnter = (event: ThaDragEvent) => {
    this.draggedOver = event.dropzoneTarget?.deref()?.name ?? '';
  };

  /**
   * Handles the drop zone leave event.
   * This clears the draggedOver property when the element leaves a drop zone.
   * @param event The ThaDragEvent for the drop zone leave.
   */
  #handleDropZoneLeave = () => {
    this.draggedOver = null;
  };

  /**
   * Creates a clone of the element for dragging.
   * This clone is used to visually represent the element during drag operations.
   * @returns The cloned element.
   */
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

  /**
   * Prepares the pre-drag data, including the bounding rectangle and styles.
   * This data is used to restore the element's state after dragging.
   * @param event The drag event.
   */
  #preparePreDragData(event: DragEvent) {
    this.preDragData.boundingRect = this.getBoundingClientRect();
    this.preDragData.dragStartEvent = event;
    this.preDragData.styles.pointerEvents = this.style.pointerEvents;
  }

  /**
   * Prepares the styles for dragging, including the position and size of the element.
   * This is used to update the element's position during drag operations.
   */
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

  /**
   * Prevents the default dragover behavior to allow custom drag-and-drop handling.
   * @param event The drag event.
   */
  #preventDragOver(event: DragEvent) {
    event.preventDefault();
  }

  /**
   * Checks if the element should handle the drag event based on the target.
   * If there are no handles, it returns true to allow the event.
   * If there are handles, it checks if the event target is one of the handles.
   * @param event The drag event.
   * @returns True if the element should handle the event, false otherwise.
   */
  #shouldHandleEvent(event: DragEvent): boolean {
    if (this.disabled) return false;
    if (!this.#handles.size) return true;

    if (this.#handles.has(event.target as DragHandleElement)) return true;

    return false;
  }
}
