import type { ThaDragEvent } from './tha-drag-event';

declare global {
  interface GlobalEventHandlersEventMap {
    thadrag: ThaDragEvent;
    thadragstart: ThaDragEvent;
    thadragend: ThaDragEvent;
    thadrop: ThaDragEvent;
    thadropend: ThaDragEvent;
    thadropped: ThaDragEvent;
    thadragenter: ThaDragEvent;
    thadragleave: ThaDragEvent;
    thadragover: ThaDragEvent;
    thadropzoneenter: ThaDragEvent;
    thadropzoneleave: ThaDragEvent;
    thadropzoneover: ThaDragEvent;
  }
}

export { DragElement } from './drag-element';
export { DropZoneElement } from './dropzone-element';
export { DragHandleElement } from './drag-handle-element';
export { ThaDragEvent } from './tha-drag-event';
export type { DragElementEventTypes, DropElementEventTypes, ThaDragEventTypes } from './tha-drag-event';
