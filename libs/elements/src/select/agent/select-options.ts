/**
 * Parse the `<datalist>` direct children of a `<tp-select-old>` host into a
 * normalised list of {@link SelectGroup}s.
 *
 * Each direct-child `<datalist>` becomes one group. The group's label is
 * derived from `<datalist label="…">`, falling back to its `id`, falling back
 * to `""` (which the element renders as an ungrouped flat list).
 *
 * Each `<option>` descendant of the datalist becomes a {@link SelectOption}
 * whose `value` falls back to the trimmed text content and whose `label`
 * falls back to `value`. Disabled state honours `option.disabled`.
 */

import type { SelectGroup, SelectOption } from "./types";

/** Parse all `<datalist>` direct children of `host` into groups. */
export function parseDatalists(host: HTMLElement): SelectGroup[] {
  const groups: SelectGroup[] = [];
  for (const child of Array.from(host.children)) {
    if (!(child instanceof HTMLDataListElement)) continue;
    groups.push(parseGroup(child));
  }
  return groups;
}

/** Parse a single `<datalist>` into a {@link SelectGroup}. */
export function parseGroup(datalist: HTMLDataListElement): SelectGroup {
  const label = readGroupLabel(datalist);
  const options: SelectOption[] = [];
  for (const node of Array.from(datalist.querySelectorAll("option"))) {
    options.push(parseOption(node));
  }
  return { source: datalist, label, options };
}

function readGroupLabel(datalist: HTMLDataListElement): string {
  const explicit = datalist.getAttribute("label");
  if (explicit !== null && explicit !== "") return explicit;
  const id = datalist.id;
  if (id) return id;
  return "";
}

function parseOption(opt: HTMLOptionElement): SelectOption {
  const text = (opt.textContent ?? "").trim();
  const explicitValue = opt.getAttribute("value");
  const value = explicitValue !== null ? explicitValue : text;
  const explicitLabel = opt.getAttribute("label");
  const label = explicitLabel !== null && explicitLabel !== "" ? explicitLabel : text || value;
  return {
    source: opt,
    value,
    label,
    disabled: opt.disabled,
  };
}

/** Flatten all options across all groups into a single array. */
export function flattenOptions(groups: readonly SelectGroup[]): SelectOption[] {
  const out: SelectOption[] = [];
  for (const g of groups) out.push(...g.options);
  return out;
}

/** Find the first option whose value equals `value`. */
export function findOptionByValue(
  groups: readonly SelectGroup[],
  value: string,
): SelectOption | null {
  for (const g of groups) {
    for (const o of g.options) {
      if (o.value === value) return o;
    }
  }
  return null;
}

// -- Value normalisation ----------------------------------------------------

/** Normalise an attribute/property value into an array of strings. */
export function normalizeValue(raw: string | null | undefined): string[] {
  if (raw == null || raw === "") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

/** Serialise an array of selected values back to the comma-separated form. */
export function serializeValue(values: readonly string[]): string {
  return values.join(",");
}
