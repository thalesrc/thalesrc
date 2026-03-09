import { days } from "@telperion/js-utils/time/days";

/**
 * Converts months to milliseconds (assumes 30 days per month)
 *
 * #### Example
 * ```typescript
 * import { months } from "@telperion/js-utils/time";
 *
 * const expiryTime = Date.now() + months(3); // ~3 months from now
 * console.log(new Date(expiryTime));
 * ```
 *
 * @param value - Number of months
 * @returns Equivalent value in milliseconds (30 days per month)
 */
export function months(value: number): number {
  return days(value) * 30;
}
