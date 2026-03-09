import { days } from "@telperion/js-utils/time/days";

/**
 * Converts weeks to milliseconds
 *
 * #### Example
 * ```typescript
 * import { weeks } from "@telperion/js-utils/time";
 *
 * const expiryTime = Date.now() + weeks(2); // 2 weeks from now
 * console.log(new Date(expiryTime));
 * ```
 *
 * @param value - Number of weeks
 * @returns Equivalent value in milliseconds
 */
export function weeks(value: number): number {
  return days(value) * 7;
}
