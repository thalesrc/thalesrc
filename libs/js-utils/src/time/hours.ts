import { minutes } from "@telperion/js-utils/time/minutes";

/**
 * Converts hours to milliseconds
 *
 * #### Example
 * ```typescript
 * import { hours } from "@telperion/js-utils/time";
 *
 * const delay = hours(1); // 3600000 milliseconds
 * setTimeout(() => console.log('Done!'), delay);
 * ```
 *
 * @param value - Number of hours
 * @returns Equivalent value in milliseconds
 */
export function hours(value: number): number {
  return minutes(value) * 60;
}
