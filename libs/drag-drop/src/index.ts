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

export * from './drag-element';
export * from './dropzone-element';
export * from './drag-handle-element';
export * from './tha-drag-event';
