import type { DragElement } from "./drag-element";
import type { DropZoneElement } from "./dropzone-element";
import { ACCEPT_DROP_PROP } from "./private-props";

export type DragElementEventTypes = 'tmdrag' | 'tmdragstart' | 'tmdragend' | 'tmdropzoneenter' | 'tmdropzoneleave' | 'tmdropzoneover' | 'tmdropped';
export type DropElementEventTypes = 'tmdrop' | 'tmdropend' | 'tmdragenter' | 'tmdragleave' | 'tmdragover';
export type TMDragEventTypes = DragElementEventTypes | DropElementEventTypes;

interface TMDragEventDict {
  dragTarget: WeakRef<DragElement>;
  dropzoneTarget?: WeakRef<DropZoneElement>;
}

export class TMDragEvent extends DragEvent {
  static #DragElementEvents: DragElementEventTypes[] = ['tmdrag', 'tmdragstart', 'tmdragend', 'tmdropzoneenter', 'tmdropzoneleave', 'tmdropzoneover', 'tmdropped'];
  static #DropElementEvents: DropElementEventTypes[] = ['tmdrop', 'tmdropend', 'tmdragenter', 'tmdragleave', 'tmdragover'];

  declare readonly dragTarget: WeakRef<DragElement>;
  declare readonly dropzoneTarget?: WeakRef<DropZoneElement>;

  get #target() {
    if (TMDragEvent.#DropElementEvents.includes(this.type as DropElementEventTypes)) {
      return this.dropzoneTarget!;
    } else if (TMDragEvent.#DragElementEvents.includes(this.type as DragElementEventTypes)) {
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
    type: TMDragEventTypes,
    { dragTarget, dropzoneTarget }: TMDragEventDict,
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
