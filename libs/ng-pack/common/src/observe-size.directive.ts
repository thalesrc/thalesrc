import { computed, Directive, effect, ElementRef, inject, output, signal } from "@angular/core";

/**
 * Directive that observes the size of its host element using `ResizeObserver`
 * and exposes the dimensions as Angular signals and outputs.
 *
 * Uses the `borderBoxSize` measurement and reports dimensions in logical
 * (inline/block) axes, making it writing-mode aware.
 *
 * Can be used as an attribute directive with event binding or exported
 * as a template reference for imperative signal access.
 *
 * @example
 * ```html
 * <!-- As an event emitter -->
 * <div (tngObserveSize)="onResize($event)">Responsive content</div>
 *
 * <!-- As a template reference via exportAs -->
 * <div tngObserveSize #sizeRef="tngObserveSize">
 *   Inline: {{ sizeRef.inlineSize() }}px,
 *   Block: {{ sizeRef.blockSize() }}px
 * </div>
 *
 * <!-- Individual axis change events -->
 * <div tngObserveSize (inlineChange)="onWidthChange($event)" (blockChange)="onHeightChange($event)">
 *   ...
 * </div>
 * ```
 */
@Directive({
  selector: '[tngObserveSize]',
  exportAs: 'tngObserveSize',
})
export class ObserveSizeDirective {
  #elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  #observer = new ResizeObserver(entries => {
    const entry = entries[0]!;

    this.#inline.set(entry.borderBoxSize[0].inlineSize);
    this.#block.set(entry.borderBoxSize[0].blockSize);
  });
  #initialRect = this.#elRef.nativeElement.getBoundingClientRect();

  #inline = signal(this.#initialRect.width);
  #block = signal(this.#initialRect.height);

  /** Readonly signal of the element's current inline size (width in horizontal writing modes). */
  inlineSize = this.#inline.asReadonly();

  /** Readonly signal of the element's current block size (height in horizontal writing modes). */
  blockSize = this.#block.asReadonly();

  /** Computed signal combining both inline and block dimensions. */
  size = computed(() => ({ inline: this.inlineSize(), block: this.blockSize() }));

  /** Emits the new inline size whenever it changes. */
  inlineChange = output<number>();

  /** Emits the new block size whenever it changes. */
  blockChange = output<number>();

  /** Emits both dimensions whenever either changes. Aliased as `tngObserveSize` for event binding. */
  sizeChange = output<{ inline: number; block: number }>({ alias: 'tngObserveSize' });

  constructor() {
    effect(cleanup => {
      this.#observer.observe(this.#elRef.nativeElement);

      cleanup(() => this.#observer.disconnect());
    });

    effect(() => {
      this.inlineChange.emit(this.inlineSize());
    });

    effect(() => {
      this.blockChange.emit(this.blockSize());
    });

    effect(() => {
      this.sizeChange.emit(this.size());
    });
  }
}
