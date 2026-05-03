/**
 * Public types for `tp-select-old`.
 *
 * Kept in a dedicated module so consumers can import them without pulling in
 * the element class (and its Lit dependency tree) when they only need the
 * shapes for typing event handlers or `FormData` extraction helpers.
 */

/** Selection cardinality of a `<tp-select-old>`. */
export type SelectionMode = "single" | "multiple";

/**
 * A single selectable option, parsed from an `<option>` descendant of one of
 * the `<datalist>` direct children of `<tp-select-old>`.
 */
export interface SelectOption {
  /** Source `<option>` element in the light DOM. */
  readonly source: HTMLOptionElement;
  /** The option's value (`option.value`, falling back to its trimmed text). */
  readonly value: string;
  /** The option's display label (`option.label`, falling back to its trimmed text). */
  readonly label: string;
  /** Whether the option is disabled. */
  readonly disabled: boolean;
}

/**
 * A group of {@link SelectOption}s, parsed from a single `<datalist>` direct
 * child of `<tp-select-old>`.
 */
export interface SelectGroup {
  /** Source `<datalist>` element in the light DOM. */
  readonly source: HTMLDataListElement;
  /**
   * The group label.
   *
   * Resolved from `<datalist label="…">`, falling back to its `id`, falling
   * back to an empty string (rendered as an ungrouped flat list).
   */
  readonly label: string;
  /** The options inside this group, in document order. */
  readonly options: readonly SelectOption[];
}

/** Detail payload for the `tp-select-change` event. */
export interface SelectChangeDetail {
  /**
   * Comma-separated string of the currently-selected values, or `""` when
   * nothing is selected. Mirrors the element's `value` attribute / property.
   */
  readonly value: string;
  /** Currently-selected values, in selection order. */
  readonly values: readonly string[];
  /** The {@link SelectOption}s corresponding to {@link values}. */
  readonly selectedOptions: readonly SelectOption[];
}
