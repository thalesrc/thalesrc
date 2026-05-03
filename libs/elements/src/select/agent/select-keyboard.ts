/**
 * Pure keyboard helpers for `tp-select-old`. Kept separate so they can be
 * unit-tested without spinning up a custom element.
 */

import type { SelectOption } from "./types";

/** Logical action triggered by a key press. */
export type SelectKeyAction =
  | "open"
  | "close"
  | "select"
  | "next"
  | "prev"
  | "first"
  | "last"
  | "typeahead"
  | null;

/**
 * Map a keyboard event to a logical action.
 *
 * The element decides what to do with `"open"` / `"close"` / `"select"`
 * based on its current open state and selection mode.
 */
export function getActionForKey(event: KeyboardEvent): SelectKeyAction {
  switch (event.key) {
    case "ArrowDown":
      return "next";
    case "ArrowUp":
      return "prev";
    case "Home":
      return "first";
    case "End":
      return "last";
    case "Enter":
      return "select";
    case " ":
    case "Spacebar":
      return "select";
    case "Escape":
    case "Esc":
      return "close";
  }
  // Single printable character → typeahead.
  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    return "typeahead";
  }
  return null;
}

interface NextIndexInput {
  /** Currently active index, or `-1` if none. */
  current: number;
  /** Direction: `1` = next, `-1` = previous. */
  direction: 1 | -1;
  /** Available options (disabled options are skipped). */
  options: readonly SelectOption[];
}

/**
 * Compute the next active option index, skipping disabled options and
 * wrapping at either end. Returns `-1` if every option is disabled.
 */
export function computeNextIndex({ current, direction, options }: NextIndexInput): number {
  const n = options.length;
  if (n === 0) return -1;
  // Bail early if every option is disabled.
  if (options.every((o) => o.disabled)) return -1;

  let i = current;
  for (let step = 0; step < n; step++) {
    i = (i + direction + n) % n;
    if (!options[i]?.disabled) return i;
  }
  return -1;
}

/** Find the first non-disabled option index in the given direction. */
export function firstEnabledIndex(options: readonly SelectOption[]): number {
  for (let i = 0; i < options.length; i++) {
    if (!options[i]?.disabled) return i;
  }
  return -1;
}

/** Find the last non-disabled option index. */
export function lastEnabledIndex(options: readonly SelectOption[]): number {
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i]?.disabled) return i;
  }
  return -1;
}

interface TypeaheadInput {
  /** Buffered typeahead string (lowercase). */
  buffer: string;
  /** Available options. */
  options: readonly SelectOption[];
  /** Where to start searching from (exclusive when buffer length === 1). */
  startIndex: number;
}

/**
 * Find the next option whose label starts with `buffer` (case-insensitive),
 * starting after `startIndex` and wrapping. When the buffer has multiple
 * characters the search begins **at** `startIndex` so a refined typeahead
 * can stay on the same option. Disabled options are skipped.
 */
export function matchTypeahead({ buffer, options, startIndex }: TypeaheadInput): number {
  if (!buffer || options.length === 0) return -1;
  const needle = buffer.toLowerCase();
  const n = options.length;
  const offset = buffer.length === 1 ? 1 : 0;
  for (let step = 0; step < n; step++) {
    const i = (startIndex + offset + step + n) % n;
    const opt = options[i];
    if (!opt || opt.disabled) continue;
    if (opt.label.toLowerCase().startsWith(needle)) return i;
  }
  return -1;
}
