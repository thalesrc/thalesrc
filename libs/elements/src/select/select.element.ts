import { PopoverElement } from "../popover";

import { provide } from "@lit/context";
import { computed, signal, Signal } from "@lit-labs/signals";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sliceBefore } from '@telperion/js-utils/array/slice-before';

import { selectContext } from "./select-context";
import { SelectedContentElement } from "./selected-content.element";
import { OptionElement } from "./option.element";
import { REGISTER_OPTION, UNREGISTER_OPTION } from "./internal-props";
import { defer } from "@telperion/js-utils/function/defer";

declare global {
  interface HTMLElementTagNameMap {
    "tp-select": SelectElement;
  }
}

@customElement("tp-select")
export class SelectElement extends LitElement {
  private static ALLOWED_OPTION_ELEMENTS = [OptionElement];
  static override styles = css`
    :host {
      position: relative;
      display: inline-flex;
      height: fit-content;
    }

    tp-popover {
      border: none;
      padding: 0;
    }
  `;

  #options = new Set<OptionElement>();

  /**
   * Provides this `<tp-select>` instance to descendants via `@lit/context`,
   * so consumers (e.g. `<tp-selected-content>`) can find it across any
   * number of shadow DOM boundaries — not just light-DOM ancestors.
   */
  @provide({ context: selectContext })
  readonly self: SelectElement = this;

  readonly selectedOptions = signal<WeakRef<OptionElement>[]>([]);


  readonly #value = computed(() =>
    this.selectedOptions
      .get()
      .map((ref) => ref.deref()?.value ?? "")
      .filter(Boolean)
      .join(","),
  );
  @property({ type: String, reflect: true, noAccessor: true })
  get value(): string {
    return this.#value.get();
  }
  set value(next: string) {
    defer(() => {
      const values = next.split(",").map((s) => s.trim());
      const options = Array.from(this.#options);

      this.selectedOptions.set(
        values
          .map((value) => options.find((option) => option.value === value))
          .filter(Boolean)
          .map((option) => new WeakRef(option!)),
      );
    });
  }

  readonly #placeholder = signal("Select an option");
  @property({ type: String, reflect: true, noAccessor: true })
  get placeholder(): string {
    return this.#placeholder.get();
  }
  set placeholder(next: string) {
    this.#signalSetter(this.#placeholder, "placeholder", next);
  }

  /**
   * Maximum number of options that can be selected at once.
   *
   * Defaults to `1` (single-select). Any positive integer enables
   * multi-select up to that many entries. Use the literal string
   * `"infinite"` in HTML to allow an unbounded
   * selection — the converter normalises it to `Number.POSITIVE_INFINITY`.
   *
   * When the limit is reached and a new option is selected, the oldest
   * entry in `selectedOptions` is dropped (FIFO) so the new selection can
   * fit. Setting `max` to a smaller number trims the current selection
   * down to size from the end.
   */
  @property({
    reflect: true,
    converter: {
      fromAttribute: (value): number => {
        if (value === null || value === undefined || value === "") return 1;

        const trimmed = String(value).trim().toLowerCase();

        if (trimmed === "infinite") return Number.POSITIVE_INFINITY;

        const parsed = Number(trimmed);
        return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
      },
      toAttribute: (value: number): string => {
        if (!Number.isFinite(value)) return "infinite";
        return String(value);
      },
    },
  })
  max: number = 1;

  protected override createRenderRoot(): ShadowRoot {
    const root = super.createRenderRoot() as ShadowRoot;

    root.adoptedStyleSheets = [
      ...root.adoptedStyleSheets,
      PopoverElement.styles.styleSheet!,
      SelectedContentElement.styles.styleSheet!
    ];

    return root;
  }

  protected override render(): unknown {
    return html`
      <div pseudo="button" part="button">
        <slot name="button">
          <tp-selected-content part="selected-content"></tp-selected-content>
        </slot>
      </div>
      <tp-popover
        position="start to start / bottom"
        target="[pseudo=button]"
        @click=${this.#handlePopoverClick}
        part="popover">
        <slot name="popover">
          <slot></slot>
        </slot>
      </tp-popover>
    `;
  }

  protected override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has("max") && Number.isFinite(this.max)) {
      const current = this.selectedOptions.get();
      if (current.length > this.max) {
        this.selectedOptions.set(current.slice(current.length - this.max));
      }
    }
  }

  selectOption(option: OptionElement): void {
    const current = this.selectedOptions.get();
    if (current.find(ref => ref.deref() === option)) return;

    const next = [...current, new WeakRef(option)];
    const trimmed = next.length > this.max
      ? next.slice(next.length - this.max)
      : next;
    this.selectedOptions.set(trimmed);
  }

  deselectOption(option: OptionElement): void {
    const optionRef = this.selectedOptions.get().find(ref => ref.deref() === option);
    if (!optionRef) return;
    this.selectedOptions.set(this.selectedOptions.get().filter(ref => ref !== optionRef));
  }

  toggleOption(option: OptionElement): void {
    const ref = this.selectedOptions.get().find(ref => ref.deref() === option);

    if (ref) {
      this.deselectOption(option);
    } else {
      this.selectOption(option);
    }
  }

  [REGISTER_OPTION](option: OptionElement): void {
    this.#options.add(option);
  }

  [UNREGISTER_OPTION](option: OptionElement): void {
    this.#options.delete(option);

    const selectedOptions = this.selectedOptions.get();
    const optionRef = selectedOptions.find(ref => ref.deref() === option);

    if (!optionRef) return;

    this.selectedOptions.set(selectedOptions.filter(ref => ref !== optionRef));
  }

  #handlePopoverClick(e: MouseEvent): void {
    const option = sliceBefore(e.composedPath(), this)
      .find(el => SelectElement.ALLOWED_OPTION_ELEMENTS.some(allowed => el instanceof allowed)) as OptionElement | undefined;

    if (!option) return;

    this.toggleOption(option);
  }

  #signalSetter<T>(signal: Signal.State<T>, propName: string, newValue: T): void {
    const previous = signal.get();
    if (previous === newValue) return;
    signal.set(newValue);
    this.requestUpdate(propName, previous);
  }
}
