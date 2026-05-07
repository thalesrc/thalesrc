import { PopoverElement } from "../popover";

import { provide } from "@lit/context";
import { computed, signal, Signal } from "@lit-labs/signals";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sliceBefore } from '@telperion/js-utils/array/slice-before';

import { selectContext } from "./select-context";
import { SelectedContentElement } from "./selected-content.element";
import { OptionElement } from "./option.element";
import { REGISTER_OPTION, UNREGISTER_OPTION } from "./internal-props";
import { SelectChangeEvent } from "./select-change-event";
import { defer } from "@telperion/js-utils/function/defer";
import { SignalWatcherLitElement } from "../utils/signal-watcher-lit-element";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A form-associated, framework-agnostic selectbox.
     *
     * Composes `<tp-popover>` for placement and `<tp-option>` for items.
     * Single-select by default; switches to multi-select via `max`.
     *
     * @example Single-select
     * ```html
     * <tp-select name="fruit" required>
     *   <tp-option value="apple">Apple</tp-option>
     *   <tp-option value="banana">Banana</tp-option>
     * </tp-select>
     * ```
     *
     * @example Multi-select with eviction limit
     * ```html
     * <tp-select name="tags" max="3">…</tp-select>
     * <tp-select name="tags" max="infinite">…</tp-select>
     * ```
     *
     * @example Custom trigger button
     * ```html
     * <tp-select>
     *   <button slot="button">Open</button>
     *   <tp-option value="a">A</tp-option>
     * </tp-select>
     * ```
     *
     * @attr value       - Comma-joined list of selected `<tp-option>` values
     *                     (read-only; derived from `selectedOptions`).
     * @attr placeholder - Text shown by `<tp-selected-content>` when no
     *                     option is selected.
     * @attr max         - `1` (default) for single-select, any positive integer
     *                     for multi-select with FIFO eviction, or `infinite`
     *                     for unbounded selection.
     * @attr name        - Form field name.
     * @attr disabled    - Non-interactive; excluded from form submission.
     * @attr required    - Empty selection triggers `valueMissing`.
     * @attr open        - Reflects the popover's open state (read-only).
     *
     * @method togglePopover - Open, close, or toggle the dropdown popover.
     *                        Overrides the native
     *                        {@link HTMLElement.togglePopover} and delegates
     *                        to the inner `<tp-popover>` (the host element
     *                        itself is not the popover). Pass `true` /
     *                        `false` (or `{ force }`) to force a state, or
     *                        omit to toggle. Returns the resulting open
     *                        state.
     * @method showPopover   - Open the dropdown popover. Overrides the native
     *                        {@link HTMLElement.showPopover} and delegates to
     *                        the inner `<tp-popover>`.
     * @method hidePopover   - Close the dropdown popover. Overrides the native
     *                        {@link HTMLElement.hidePopover} and delegates to
     *                        the inner `<tp-popover>`.
     *
     * @slot button    - Replaces the default trigger button.
     * @slot indicator - Replaces the default open/close caret (`▾`) shown
     *                   inside the trigger button. Rendered next to
     *                   `<tp-selected-content>`; rotates 180° while the
     *                   select is `open` (via the `[pseudo="indicator"]`
     *                   styling).
     * @slot popover   - Replaces the default rendering of the host's children
     *                   inside the panel. Use this when you want to keep the
     *                   `<tp-option>`s registered in the select context — so
     *                   selection, validation and form submission still work —
     *                   but display something else in the popover (a message,
     *                   a search field, a custom layout, …) instead of the
     *                   default option list.
     * @slot placeholder - Replaces the default placeholder span inside
     *                   `<tp-selected-content>` when no option is selected.
     *                   Forwarded by the light-DOM `<slot name="placeholder">`
     *                   that `<tp-selected-content>` renders, so any direct
     *                   child of `<tp-select>` carrying `slot="placeholder"`
     *                   is projected as the empty-state label (icon + text,
     *                   custom markup, etc.).
     * @slot           - Default slot inside the popover (where `<tp-option>`s go).
     *
     * @csspart button                   - The trigger wrapper.
     * @csspart indicator                - The default open/close caret (`▾`).
     *                                     Rotated 180° while the select is `open`.
     *                                     Suppressed when the `indicator` slot is
     *                                     filled.
     * @csspart popover                  - The `<tp-popover>` panel.
     * @csspart selected-content         - The default `<tp-selected-content>`.
     * @csspart placeholder              - The `<span>` rendered by the default
     *                                     `<tp-selected-content>` when no option
     *                                     is selected (renders the `placeholder`
     *                                     attribute). Exposed because
     *                                     `<tp-selected-content>` is light-DOM
     *                                     and lives inside this element's shadow
     *                                     root by default.
     * @csspart selected-content-option  - Each cloned `<tp-option>` mirrored by
     *                                     the default `<tp-selected-content>`.
     *                                     Exposed for the same reason as
     *                                     `placeholder`. Set on the clones
     *                                     themselves — use
     *                                     `tp-select::part(selected-content-option)`
     *                                     to style them.
     *
     * @fires change - {@link SelectChangeEvent} dispatched when the selected
     *                 option set changes. Bubbles, not composed (mirrors the
     *                 native `<select>` `change` event). Not fired on initial
     *                 mount or when the selection is re-set to the same value.
     */
    "tp-select": SelectElement;
  }
}

@customElement("tp-select")
export class SelectElement extends SignalWatcherLitElement {
  static formAssociated = true;

  private static ALLOWED_OPTION_ELEMENTS = [OptionElement];
  static styles = css`
    :host {
      position: relative;
      display: inline-flex;
      height: fit-content;

      --tp-select-option-color: white;
      --tp-select-selection-color: #0078d4;
      --tp-select-highlight-percent: 20%;
      --tp-select-selection-contrast-color: white;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.6;
    }

    :host([open]) {
      [pseudo="indicator"] {
        transform: rotateX(180deg);
      }
    }

    [pseudo="button"] {
      background: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      padding: 0.25em 0.5em;

      tp-selected-content {
        margin-inline-end: 0.5em;
      }
    }

    [pseudo="indicator"] {
      margin-inline-start: auto;
    }

    tp-popover {
      border: none;
      padding: 0;
    }
  `;

  #options = new Set<OptionElement>();
  get #popover(): PopoverElement {
    return this.shadowRoot?.querySelector("tp-popover")!;
  }

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

  /** Form field name. Submitted with the owning `<form>`. */
  @property({ type: String, reflect: true })
  name: string | null = null;

  /** When true, the element is non-interactive and excluded from form submission. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** When true, an empty selection makes the element invalid (`valueMissing`). */
  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: Boolean, reflect: true })
  open = false;

  readonly #internals: ElementInternals;
  /** Initial `value` captured at construction so `formResetCallback` can restore it. */
  #initialValue = "";
  /**
   * Last `value` for which a `change` event was emitted (or considered for
   * emission). `null` means "no sync has happened yet" — used to suppress
   * the very first `willUpdate` so we don't emit a phantom change on mount.
   */
  #lastEmittedValue: string | null = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  /** Live `ElementInternals` (validity, form, labels, etc.). */
  get internals(): ElementInternals {
    return this.#internals;
  }

  /** Owning `<form>` element, or `null` when not associated. */
  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  /** Native validity state of this control. */
  get validity(): ValidityState {
    return this.#internals.validity;
  }

  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  get willValidate(): boolean {
    return this.#internals.willValidate;
  }

  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.#internals.reportValidity();
  }

  protected override createRenderRoot(): ShadowRoot {
    const root = super.createRenderRoot() as ShadowRoot;

    root.adoptedStyleSheets = [
      ...root.adoptedStyleSheets,
      PopoverElement.styles.styleSheet!,
      SelectedContentElement.styles.styleSheet!,
      OptionElement.styles.styleSheet!,
    ];

    return root;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#initialValue = this.value;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  protected override render(): unknown {
    return html`
      <div pseudo="button" part="button">
        <slot name="button">
          <tp-selected-content part="selected-content"></tp-selected-content>
          <slot name="indicator">
            <span part="indicator" pseudo="indicator">▾</span>
          </slot>
        </slot>
      </div>
      <tp-popover
        position="start to start / bottom"
        target="[pseudo=button]"
        @click=${this.#handlePopoverClick}
        @toggle=${this.#handlePopoverToggle}
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

  /**
   * Keep `ElementInternals` in sync with the current value and validity.
   * Reading `this.value` here transitively reads `selectedOptions`, so the
   * `SignalWatcher` base auto-tracks it and re-runs `willUpdate` whenever
   * the selection changes — no `updateEffect` (and no microtask race) needed.
   */
  protected override willUpdate(_changed: Map<string, unknown>): void {
    this.#syncForm();
    this.#dispatchChange();
  }

  // -- Form-associated callbacks ------------------------------------------

  formResetCallback(): void {
    this.value = this.#initialValue;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (state == null) {
      this.value = "";
      return;
    }
    if (typeof state === "string") {
      this.value = state;
      return;
    }
    if (state instanceof FormData) {
      const values: string[] = [];
      state.forEach((v) => {
        if (typeof v === "string") values.push(v);
      });
      this.value = values.join(",");
    }
  }

  /**
   * Push the current selection into `ElementInternals`. Single-select forms
   * report a string; multi-select forms report a `FormData` with one entry
   * per selected value (so the form serialises the same way as a native
   * `<select multiple>`). Also updates validity for `required`.
   */
  #syncForm(): void {
    const values = this.value === "" ? [] : this.value.split(",");
    if (this.max === 1) {
      this.#internals.setFormValue(values[0] ?? "");
    } else {
      const fd = new FormData();
      const fieldName = this.name ?? "";
      for (const v of values) fd.append(fieldName, v);
      this.#internals.setFormValue(fd);
    }
    if (this.required && values.length === 0) {
      this.#internals.setValidity({ valueMissing: true }, "Please select an option.");
    } else {
      this.#internals.setValidity({});
    }
  }

  /**
   * Dispatch a `SelectChangeEvent` when the joined value has actually
   * changed. Suppresses the very first sync so consumers don't see a
   * phantom `change` on mount (matches native `<select>` behavior).
   */
  #dispatchChange(): void {
    const current = this.value;

    if (current === this.#lastEmittedValue) return;

    const isInitialSync = this.#lastEmittedValue === null;
    this.#lastEmittedValue = current;

    if (isInitialSync) return;

    const selectedOptions = this.selectedOptions
      .get()
      .map(ref => ref.deref())
      .filter(Boolean) as OptionElement[];

    this.dispatchEvent(new SelectChangeEvent({ value: current, selectedOptions }));
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

  /**
   * Open, close, or toggle the dropdown popover.
   *
   * Overrides the native {@link HTMLElement.togglePopover} so callers can
   * drive the select from outside without reaching into the shadow DOM.
   * `<tp-select>` itself is not the popover element — the actual popover
   * lives inside its shadow root — so the call is delegated to the inner
   * `<tp-popover>`.
   *
   * @param options Same shape as the native API: pass `true` to force open,
   *   `false` to force close, or a `{ force }` options bag. Omit to toggle
   *   between the two states.
   * @returns `true` if the popover ends up open, `false` otherwise (matching
   *   the native return value). Returns `false` early if the inner popover
   *   isn't reachable yet (for example, before the first render).
   *
   * @example
   * ```ts
   * const select = document.querySelector('tp-select');
   * select.togglePopover();      // toggle
   * select.togglePopover(true);  // force open
   * select.togglePopover(false); // force close
   * ```
   */
  override togglePopover(): boolean {
    return this.#popover.togglePopover();
  }

  /**
   * Close the dropdown popover.
   *
   * Overrides the native {@link HTMLElement.hidePopover} so callers can
   * close the select from outside without reaching into the shadow DOM.
   * `<tp-select>` itself is not the popover element — the actual popover
   * lives inside its shadow root — so the call is delegated to the inner
   * `<tp-popover>`.
   *
   * No-op if the popover is already closed.
   *
   * @example
   * ```ts
   * document.querySelector('tp-select').hidePopover();
   * ```
   */
  override hidePopover(): void {
    this.#popover.hidePopover();
  }

  /**
   * Open the dropdown popover.
   *
   * Overrides the native {@link HTMLElement.showPopover} so callers can
   * open the select from outside without reaching into the shadow DOM.
   * `<tp-select>` itself is not the popover element — the actual popover
   * lives inside its shadow root — so the call is delegated to the inner
   * `<tp-popover>`.
   *
   * @param options Same shape as the native API (e.g. `{ source }` to set
   *   the invoker for the popover invoker relationship).
   *
   * @example
   * ```ts
   * document.querySelector('tp-select').showPopover();
   * ```
   */
  override showPopover(): void {
    this.#popover.showPopover();
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
    if (this.disabled) return;

    const option = sliceBefore(e.composedPath(), this)
      .find(el => SelectElement.ALLOWED_OPTION_ELEMENTS.some(allowed => el instanceof allowed)) as OptionElement | undefined;

    if (!option) return;

    this.toggleOption(option);
    const count = this.selectedOptions.get().length;

    // Close the popover when a new selection just filled the quota.
    if (count >= this.max) {
      const popover = this.shadowRoot?.querySelector("tp-popover");
      popover?.hidePopover();
    }
  }

  #handlePopoverToggle(e: ToggleEvent): void {
    this.open = e.newState === "open";
  }

  #signalSetter<T>(signal: Signal.State<T>, propName: string, newValue: T): void {
    const previous = signal.get();
    if (previous === newValue) return;
    signal.set(newValue);
    this.requestUpdate(propName, previous);
  }
}
