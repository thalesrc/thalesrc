/**
 * Converts seconds to milliseconds
 *
 * #### Example
 * ```typescript
 * import { seconds } from "@telperion/js-utils/time";
 *
 * const delay = seconds(5); // 5000 milliseconds
 * setTimeout(() => console.log('Done!'), delay);
 * ```
 *
 * @param value - Number of seconds
 * @returns Equivalent value in milliseconds
 */
export function seconds(value: number): number {
  return value * 1000;
}
