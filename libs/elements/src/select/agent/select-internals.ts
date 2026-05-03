/**
 * Form-association helpers for `<tp-select-old>`.
 *
 * Wraps `ElementInternals` with the small surface the element needs:
 *
 * - Synchronising the form value (single string vs `FormData` with one entry
 *   per selected value when `multiple`).
 * - Synchronising validity for `required`.
 * - Restoring state from `formStateRestoreCallback`.
 *
 * Kept in its own module so the element class file stays focused on
 * lifecycle + rendering.
 */

export interface SyncValueInput {
  internals: ElementInternals;
  /** The element's `name` attribute (used to key `FormData` entries). */
  name: string | null;
  /** The current selected values, in selection order. */
  values: readonly string[];
  /** Whether the element is in `multiple` mode. */
  multiple: boolean;
}

/**
 * Push the current selection into the owning form via `ElementInternals`.
 *
 * - Single mode: `setFormValue(value)` — empty string when nothing selected.
 * - Multiple mode: build a `FormData` with one entry per value (mirrors
 *   native `<select multiple>` submission). When the element has no `name`,
 *   `setFormValue("")` is a no-op for submission but still sets the
 *   reportable state value.
 */
export function syncFormValue({ internals, name, values, multiple }: SyncValueInput): void {
  if (!multiple) {
    const v = values[0] ?? "";
    internals.setFormValue(v);
    return;
  }
  if (!name || values.length === 0) {
    internals.setFormValue("");
    return;
  }
  const data = new FormData();
  for (const v of values) data.append(name, v);
  internals.setFormValue(data);
}

export interface SyncValidityInput {
  internals: ElementInternals;
  required: boolean;
  hasValue: boolean;
  /** Anchor element used by `reportValidity()` to position the bubble. */
  anchor: HTMLElement;
}

/** Update the validity flags from `required` + presence of value. */
export function syncValidity({ internals, required, hasValue, anchor }: SyncValidityInput): void {
  if (required && !hasValue) {
    internals.setValidity({ valueMissing: true }, "Please select an option.", anchor);
    return;
  }
  internals.setValidity({});
}

/**
 * Decode a state value coming back from `formStateRestoreCallback`.
 *
 * The element always submits its restorable state as a comma-separated
 * string (single or multiple), so a `FormData` payload can simply be
 * collected back into an array.
 */
export function restoreState(state: File | string | FormData | null, multiple: boolean): string[] {
  if (state == null) return [];
  if (typeof state === "string") {
    if (state === "") return [];
    return multiple ? state.split(",").map((s) => s.trim()).filter(Boolean) : [state];
  }
  if (state instanceof FormData) {
    const out: string[] = [];
    state.forEach((value) => {
      if (typeof value === "string") out.push(value);
    });
    return out;
  }
  return [];
}
