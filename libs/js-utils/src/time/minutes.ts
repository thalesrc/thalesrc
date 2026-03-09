import { seconds } from "@telperion/js-utils/time/seconds";

/**
 * Converts minutes to milliseconds
 *
 * #### Example
 * ```typescript
 * import { minutes } from "@telperion/js-utils/time";
 *
 * const delay = minutes(2); // 120000 milliseconds
 * setTimeout(() => console.log('Done!'), delay);
 * ```
 *
 * @param value - Number of minutes
 * @returns Equivalent value in milliseconds
 */
export function minutes(value: number): number {
  return seconds(value) * 60;
}
