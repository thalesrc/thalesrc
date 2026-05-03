import { LitElement, html, nothing } from "lit";
import type { PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { uniqueId } from "@telperion/js-utils/unique-id";

import "../../popover/popover-element";
import type { PopoverElement } from "../../popover/popover-element";

import { SELECT_GLOBAL_CSS } from "./select-styles";
import {
  findOptionByValue,
  flattenOptions,
  normalizeValue,
  parseDatalists,
  serializeValue,
} from "./select-options";
import {
  computeNextIndex,
  firstEnabledIndex,
  getActionForKey,
  lastEnabledIndex,
  matchTypeahead,
} from "./select-keyboard";
import { restoreState, syncFormValue, syncValidity } from "./select-internals";
import type { SelectChangeDetail, SelectGroup, SelectOption } from "./types";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A framework-agnostic select element.
     *
     * Renders a trigger + listbox panel anchored to the trigger via
     * `tp-popover`. Options come from one or more `<datalist>` direct
     * children — each `<datalist>` is treated as an option group whose
     * label falls back from `label` → `id` → `""`.
     *
     * Form-associated: participates in `<form>` submission and validation
     * via `ElementInternals` (single → one entry; `multiple` → one entry
     * per selected value, mirroring native `<select multiple>`). Restores
     * its value on form reset / state restore.
     *
     * Keyboard: `ArrowUp` / `ArrowDown` move the active option, `Home` /
     * `End` jump to the first/last enabled option, `Enter` / `Space`
     * select (toggle in `multiple` mode), `Escape` closes the panel,
     * printable characters perform typeahead.
     *
     * @example Single selection
     * ```html
     * <tp-select-old name="fruit" placeholder="Pick a fruit">
     *   <datalist>
     *     <option value="apple">Apple</option>
     *     <option value="banana">Banana</option>
     *   </datalist>
     * </tp-select-old>
     * ```
     *
     * @example Multiple groups
     * ```html
     * <tp-select-old name="city" multiple>
     *   <datalist label="Europe">
     *     <option>Paris</option>
     *     <option>Berlin</option>
     *   </datalist>
     *   <datalist label="Asia">
     *     <option>Tokyo</option>
     *     <option disabled>Pyongyang</option>
     *   </datalist>
     * </tp-select-old>
     * ```
     *
     * @attr name - Form field name.
     * @attr value - Comma-separated currently-selected value(s).
     * @attr multiple - Boolean; allows selecting multiple options.
     * @attr disabled - Boolean; disables the trigger.
     * @attr required - Boolean; drives `valueMissing` validity.
     * @attr placeholder - Text shown on the trigger when nothing is selected.
     * @attr position - Forwarded to the inner `tp-popover`.
     * @attr open - Boolean; reflects the panel's open state.
     *
     * @fires tp-select-change - When the selection changes.
     * @fires tp-select-open - When the panel opens.
     * @fires tp-select-close - When the panel closes.
     */
    "tp-select-old": SelectElement;
  }

  interface GlobalEventHandlersEventMap {
    "tp-select-change": CustomEvent<SelectChangeDetail>;
    "tp-select-open": CustomEvent<void>;
    "tp-select-close": CustomEvent<void>;
  }
}

const DEFAULT_POSITION = "start to start / top to bottom";

@customElement("tp-select-old")
export class SelectElement extends LitElement {
  static formAssociated = true;

  declare private static GLOBAL_STYLE: HTMLStyleElement;

  static {
    const style = (this.GLOBAL_STYLE = document.createElement("style"));
    style.textContent = SELECT_GLOBAL_CSS;
    document.head.appendChild(style);
  }

  /** Form field name (used by ElementInternals on submission). */
  @property({ reflect: true })
  name: string | null = null;

  /** Comma-separated currently-selected value(s). */
  @property({ reflect: true })
  value = "";

  /** Multi-select mode. */
  @property({ type: Boolean, reflect: true })
  multiple = false;

  /** Disable the trigger. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Mark the field as required for form validation. */
  @property({ type: Boolean, reflect: true })
  required = false;

  /** Placeholder text shown on the trigger when nothing is selected. */
  @property({ reflect: true })
  placeholder = "";

  /** Forwarded as-is to the inner `tp-popover`. */
  @property({ reflect: true })
  position: string | null = DEFAULT_POSITION;

  /** Reflects the panel's open state. Set via popover toggle events. */
  @property({ type: Boolean, reflect: true })
  open = false;

  // -- Internal reactive state ---------------------------------------------

  @state()
  private _groups: SelectGroup[] = [];

  @state()
  private _activeIndex = -1;

  // -- Identity / wiring ---------------------------------------------------

  readonly #uid = uniqueId("tp-select-old");
  readonly #listboxId = `${this.#uid}-listbox`;

  #internals: ElementInternals;
  #initialValue = "";
  #childObserver?: MutationObserver;
  #typeaheadBuffer = "";
  #typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  // -- Public read-only accessors ------------------------------------------

  /** Currently-selected values, in selection order. */
  get values(): string[] {
    return normalizeValue(this.value);
  }

  /** Currently-selected {@link SelectOption}s. */
  get selectedOptions(): SelectOption[] {
    const out: SelectOption[] = [];
    for (const v of this.values) {
      const o = findOptionByValue(this._groups, v);
      if (o) out.push(o);
    }
    return out;
  }

  /** Live `ElementInternals` (validity, form, etc.) — exposed for tests. */
  get internals(): ElementInternals {
    return this.#internals;
  }

  // -- Lifecycle -----------------------------------------------------------

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#initialValue = this.value;
    this.#refreshGroups();
    this.#childObserver = new MutationObserver(() => {
      this.#refreshGroups();
      this.requestUpdate();
    });
    this.#childObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["value", "label", "disabled", "id", "tp-select-button"],
      characterData: true,
    });
    this.addEventListener("keydown", this.#onKeyDown);
    this.#syncForm();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#childObserver?.disconnect();
    this.#childObserver = undefined;
    this.removeEventListener("keydown", this.#onKeyDown);
    if (this.#typeaheadTimer !== null) {
      clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = null;
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("value") || changed.has("multiple") || changed.has("required") || changed.has("name")) {
      this.#syncForm();
    }
    this.#syncExternalButton();
  }

  // -- Form-associated callbacks ------------------------------------------

  formResetCallback(): void {
    this.#setSelection(normalizeValue(this.#initialValue), { silent: true });
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    const restored = restoreState(state, this.multiple);
    this.#setSelection(restored, { silent: true });
  }

  // -- Public methods ------------------------------------------------------

  /** Open the dropdown panel. */
  show(): void {
    if (this.disabled) return;
    const popover = this.#popover();
    try {
      popover?.showPopover();
    } catch {
      /* not connected / already open */
    }
  }

  /** Close the dropdown panel. */
  hide(): void {
    const popover = this.#popover();
    try {
      popover?.hidePopover();
    } catch {
      /* not connected / already closed */
    }
  }

  /** Toggle the dropdown panel. */
  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }

  // -- Render --------------------------------------------------------------

  protected override render(): TemplateResult {
    const options = flattenOptions(this._groups);
    const selected = new Set(this.values);
    const activeId = this._activeIndex >= 0 ? this.#optionDomId(this._activeIndex) : "";
    const labelText = this.#triggerLabel();
    const hasExternalButton = this.#externalButton() !== null;

    return html`
      ${hasExternalButton
        ? nothing
        : html`
            <button
              type="button"
              part="trigger"
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded=${this.open ? "true" : "false"}
              aria-controls=${this.#listboxId}
              aria-activedescendant=${activeId || nothing}
              ?disabled=${this.disabled}
            >
              <span
                part="trigger-label"
                ?data-placeholder=${labelText === this.placeholder && this.values.length === 0}
              >
                ${labelText}
              </span>
              <span part="trigger-arrow" aria-hidden="true"></span>
            </button>
          `}
      <tp-popover
        part="panel"
        position=${this.position ?? DEFAULT_POSITION}
        trigger="click"
        @toggle=${this.#onPopoverToggle}
      >
        <div
          part="listbox"
          id=${this.#listboxId}
          role="listbox"
          aria-multiselectable=${this.multiple ? "true" : "false"}
          @click=${this.#onListboxClick}
          @pointermove=${this.#onListboxPointerMove}
        >
          ${repeat(
            this._groups,
            (g, i) => g.source.id || `g-${i}`,
            (group) => this.#renderGroup(group, options, selected),
          )}
        </div>
      </tp-popover>
    `;
  }

  #renderGroup(
    group: SelectGroup,
    flat: readonly SelectOption[],
    selected: ReadonlySet<string>,
  ): TemplateResult {
    return html`
      <div part="group" role="group" aria-label=${group.label || nothing}>
        ${group.label
          ? html`<div part="group-label">${group.label}</div>`
          : nothing}
        ${group.options.map((opt) => {
          const flatIndex = flat.indexOf(opt);
          const id = this.#optionDomId(flatIndex);
          const isSelected = selected.has(opt.value);
          const isActive = flatIndex === this._activeIndex;
          return html`
            <div
              part="option"
              id=${id}
              role="option"
              data-value=${opt.value}
              data-index=${String(flatIndex)}
              data-active=${isActive ? "true" : "false"}
              aria-selected=${isSelected ? "true" : "false"}
              aria-disabled=${opt.disabled ? "true" : "false"}
            >
              ${opt.label}
            </div>
          `;
        })}
      </div>
    `;
  }

  // -- Helpers -------------------------------------------------------------

  #popover(): PopoverElement | null {
    return this.querySelector(":scope > tp-popover") as PopoverElement | null;
  }

  /**
   * The first direct-child element flagged with the `tp-select-button`
   * attribute, if any. When present, the default `<button>` is suppressed
   * and ARIA state is mirrored onto the consumer's element instead.
   */
  #externalButton(): HTMLElement | null {
    const el = this.querySelector(":scope > [tp-select-button]");
    return el instanceof HTMLElement ? el : null;
  }

  /**
   * Mirror combobox ARIA + disabled state onto a consumer-supplied trigger.
   * Skipped when no `[tp-select-button]` child exists (the default Lit
   * template handles the attributes itself in that case).
   */
  #syncExternalButton(): void {
    const btn = this.#externalButton();
    if (!btn) return;
    const activeId = this._activeIndex >= 0 ? this.#optionDomId(this._activeIndex) : "";
    if (!btn.hasAttribute("role")) btn.setAttribute("role", "combobox");
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-controls", this.#listboxId);
    btn.setAttribute("aria-expanded", this.open ? "true" : "false");
    if (activeId) btn.setAttribute("aria-activedescendant", activeId);
    else btn.removeAttribute("aria-activedescendant");
    if (this.disabled) btn.setAttribute("disabled", "");
    else btn.removeAttribute("disabled");
  }

  #optionDomId(index: number): string {
    return `${this.#uid}-opt-${index}`;
  }

  #triggerLabel(): string {
    const selected = this.selectedOptions;
    if (selected.length === 0) return this.placeholder;
    return selected.map((o) => o.label).join(", ");
  }

  #refreshGroups(): void {
    this._groups = parseDatalists(this);
    // Drop active index if it now points beyond the available options.
    const total = flattenOptions(this._groups).length;
    if (this._activeIndex >= total) this._activeIndex = -1;
  }

  #syncForm(): void {
    syncFormValue({
      internals: this.#internals,
      name: this.name,
      values: this.values,
      multiple: this.multiple,
    });
    syncValidity({
      internals: this.#internals,
      required: this.required,
      hasValue: this.values.length > 0,
      anchor: this,
    });
  }

  // -- Events --------------------------------------------------------------

  #onPopoverToggle = (event: Event): void => {
    const e = event as ToggleEvent;
    const next = e.newState === "open";
    if (this.open === next) return;
    this.open = next;
    if (next) {
      // Move active to first selected, or first enabled option.
      const flat = flattenOptions(this._groups);
      const firstSel = this.values[0];
      const sel = firstSel ? flat.findIndex((o) => o.value === firstSel) : -1;
      this._activeIndex = sel >= 0 ? sel : firstEnabledIndex(flat);
      this.dispatchEvent(new CustomEvent("tp-select-open", { bubbles: true, composed: true }));
    } else {
      this.dispatchEvent(new CustomEvent("tp-select-close", { bubbles: true, composed: true }));
    }
  };

  #onListboxClick = (event: MouseEvent): void => {
    const target = (event.target as HTMLElement | null)?.closest('[part="option"]');
    if (!(target instanceof HTMLElement)) return;
    if (target.getAttribute("aria-disabled") === "true") return;
    const value = target.dataset["value"];
    if (value == null) return;
    this.#toggleValue(value);
  };

  #onListboxPointerMove = (event: PointerEvent): void => {
    const target = (event.target as HTMLElement | null)?.closest('[part="option"]');
    if (!(target instanceof HTMLElement)) return;
    const idxRaw = target.dataset["index"];
    if (idxRaw == null) return;
    const idx = Number(idxRaw);
    if (Number.isFinite(idx) && idx !== this._activeIndex) {
      this._activeIndex = idx;
    }
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const action = getActionForKey(event);
    if (!action) return;
    const flat = flattenOptions(this._groups);

    // While closed, most navigation keys open the panel.
    if (!this.open) {
      switch (action) {
        case "open":
        case "next":
        case "prev":
        case "first":
        case "last":
        case "select":
          event.preventDefault();
          this.show();
          return;
        case "typeahead":
          event.preventDefault();
          this.show();
          this.#typeahead(event.key, flat);
          return;
        default:
          return;
      }
    }

    switch (action) {
      case "close":
        event.preventDefault();
        this.hide();
        return;
      case "next":
        event.preventDefault();
        this._activeIndex = computeNextIndex({
          current: this._activeIndex,
          direction: 1,
          options: flat,
        });
        return;
      case "prev":
        event.preventDefault();
        this._activeIndex = computeNextIndex({
          current: this._activeIndex,
          direction: -1,
          options: flat,
        });
        return;
      case "first":
        event.preventDefault();
        this._activeIndex = firstEnabledIndex(flat);
        return;
      case "last":
        event.preventDefault();
        this._activeIndex = lastEnabledIndex(flat);
        return;
      case "select": {
        event.preventDefault();
        const opt = flat[this._activeIndex];
        if (opt && !opt.disabled) this.#toggleValue(opt.value);
        return;
      }
      case "typeahead":
        event.preventDefault();
        this.#typeahead(event.key, flat);
        return;
    }
  };

  #typeahead(char: string, flat: readonly SelectOption[]): void {
    if (this.#typeaheadTimer !== null) clearTimeout(this.#typeaheadTimer);
    this.#typeaheadBuffer += char.toLowerCase();
    const start = this._activeIndex >= 0 ? this._activeIndex : -1;
    const idx = matchTypeahead({
      buffer: this.#typeaheadBuffer,
      options: flat,
      startIndex: start,
    });
    if (idx >= 0) this._activeIndex = idx;
    this.#typeaheadTimer = setTimeout(() => {
      this.#typeaheadBuffer = "";
      this.#typeaheadTimer = null;
    }, 500);
  }

  // -- Selection mutation --------------------------------------------------

  #toggleValue(value: string): void {
    const current = this.values;
    let next: string[];
    if (this.multiple) {
      const i = current.indexOf(value);
      next = i >= 0
        ? [...current.slice(0, i), ...current.slice(i + 1)]
        : [...current, value];
    } else {
      next = [value];
    }
    this.#setSelection(next);
    if (!this.multiple) this.hide();
  }

  #setSelection(values: readonly string[], { silent = false }: { silent?: boolean } = {}): void {
    const next = serializeValue(values);
    if (next === this.value) return;
    this.value = next;
    if (silent) return;
    const detail: SelectChangeDetail = {
      value: next,
      values: [...values],
      selectedOptions: this.selectedOptions,
    };
    this.dispatchEvent(
      new CustomEvent("tp-select-change", { detail, bubbles: true, composed: true }),
    );
  }
}
