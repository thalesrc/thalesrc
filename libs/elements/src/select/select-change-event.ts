import type { OptionElement } from "./option.element";

interface SelectChangeEventInit {
  value: string;
  selectedOptions: readonly OptionElement[];
}

/**
 * Dispatched by `<tp-select>` whenever its selected option set changes.
 *
 * Mirrors the native `<select>` `change` event semantics:
 * - type is `'change'`
 * - `bubbles: true`, `composed: false`, `cancelable: false` by default
 * - not fired on initial mount, nor when the selection is set to the
 *   same value it already had
 *
 * @example
 * ```ts
 * select.addEventListener('change', e => {
 *   if (e instanceof SelectChangeEvent) {
 *     console.log(e.value, e.selectedOptions);
 *   }
 * });
 * ```
 */
export class SelectChangeEvent extends Event {
  /** Joined value string of the new selection (same as `tp-select.value`). */
  readonly value: string;

  /** Snapshot of the currently selected `<tp-option>` elements. */
  readonly selectedOptions: readonly OptionElement[];

  constructor(init: SelectChangeEventInit, eventInit?: EventInit) {
    super("change", { bubbles: true, composed: false, cancelable: false, ...eventInit });

    this.value = init.value;
    this.selectedOptions = init.selectedOptions;
  }
}
