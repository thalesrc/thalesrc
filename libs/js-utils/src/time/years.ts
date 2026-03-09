import { days } from "@telperion/js-utils/time/days";

/**
 * Converts years to milliseconds (assumes 365 days per year)
 *
 * #### Example
 * ```typescript
 * import { years } from "@telperion/js-utils/time";
 *
 * const expiryTime = Date.now() + years(1); // ~1 year from now
 * console.log(new Date(expiryTime));
 * ```
 *
 * @param value - Number of years
 * @returns Equivalent value in milliseconds (365 days per year)
 */
export function years(value: number): number {
  return days(value) * 365;
}
