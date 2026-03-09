import { hours } from "@telperion/js-utils/time/hours";

/**
 * Converts days to milliseconds
 *
 * #### Example
 * ```typescript
 * import { days } from "@telperion/js-utils/time";
 *
 * const expiryTime = Date.now() + days(7); // 7 days from now
 * console.log(new Date(expiryTime));
 * ```
 *
 * @param value - Number of days
 * @returns Equivalent value in milliseconds
 */
export function days(value: number): number {
  return hours(value) * 24;
}
