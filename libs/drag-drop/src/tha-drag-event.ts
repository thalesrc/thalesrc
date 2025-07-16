import type { DragElement } from "./drag-element";
import type { DropZoneElement } from "./dropzone-element";
import { ACCEPT_DROP_PROP } from "./private-props";

export type DragElementEventTypes = 'thadrag' | 'thadragstart' | 'thadragend' | 'thadropzoneenter' | 'thadropzoneleave' | 'thadropzoneover' | 'thadropped';
export type DropElementEventTypes = 'thadrop' | 'thadropend' | 'thadragenter' | 'thadragleave' | 'thadragover';
export type ThaDragEventTypes = DragElementEventTypes | DropElementEventTypes;

interface ThaDragEventDict {
  dragTarget: WeakRef<DragElement>;
  dropzoneTarget?: WeakRef<DropZoneElement>;
}

export class ThaDragEvent extends DragEvent {
  static #DragElementEvents: DragElementEventTypes[] = ['thadrag', 'thadragstart', 'thadragend', 'thadropzoneenter', 'thadropzoneleave', 'thadropzoneover', 'thadropped'];
  static #DropElementEvents: DropElementEventTypes[] = ['thadrop', 'thadropend', 'thadragenter', 'thadragleave', 'thadragover'];

  declare readonly dragTarget: WeakRef<DragElement>;
  declare readonly dropzoneTarget?: WeakRef<DropZoneElement>;

  get #target() {
    if (ThaDragEvent.#DropElementEvents.includes(this.type as DropElementEventTypes)) {
      return this.dropzoneTarget!;
    } else if (ThaDragEvent.#DragElementEvents.includes(this.type as DragElementEventTypes)) {
      return this.dragTarget;
    }

    return new WeakRef(this.target as (DragElement | DropZoneElement));
  }

  get name(): string | undefined {
    return this.#target.deref()?.name;
  }

  get dragData() {
    return this.dragTarget.deref()?.dragData;
  }

  constructor(
    type: ThaDragEventTypes,
    { dragTarget, dropzoneTarget }: ThaDragEventDict,
    eventInitDict?: DragEventInit
  ) {
    super(type, eventInitDict);

    this.dragTarget = dragTarget;
    this.dropzoneTarget = dropzoneTarget;
  }

  acceptDrop(rect?: DOMRect) {
    this.dragTarget.deref()?.[ACCEPT_DROP_PROP](this.dropzoneTarget!, rect);
  }
}
