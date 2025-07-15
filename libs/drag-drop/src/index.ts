import type { TMDragEvent } from './tm-drag-event';

declare global {
  interface GlobalEventHandlersEventMap {
    tmdrag: TMDragEvent;
    tmdragstart: TMDragEvent;
    tmdragend: TMDragEvent;
    tmdrop: TMDragEvent;
    tmdropend: TMDragEvent;
    tmdropped: TMDragEvent;
    tmdragenter: TMDragEvent;
    tmdragleave: TMDragEvent;
    tmdragover: TMDragEvent;
    tmdropzoneenter: TMDragEvent;
    tmdropzoneleave: TMDragEvent;
    tmdropzoneover: TMDragEvent;
  }
}

export * from './drag-element';
export * from './dropzone-element';
export * from './tm-drag-event';
