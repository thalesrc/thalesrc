import { Pipe, PipeTransform } from "@angular/core";
import { minMax } from '@telperion/js-utils/math/min-max';

/**
 * Angular pipe that generates an array of sequential integers `[0, 1, ..., n-1]`
 * from a given number, useful for repeating template blocks a specific number of times.
 *
 * Handles edge cases gracefully:
 * - `null` / `undefined` → `[]`
 * - Negative numbers → `[]`
 * - `NaN` → `[]`
 * - Values exceeding `Number.MAX_SAFE_INTEGER` are clamped
 *
 * @example
 * ```html
 * <!-- Repeat 5 stars -->
 * @for (i of 5 | times; track i) {
 *   <span>⭐</span>
 * }
 *
 * <!-- Dynamic count -->
 * @for (i of rating | times; track i) {
 *   <app-star [filled]="true" />
 * }
 * ```
 */
@Pipe({ name: "times", standalone: true })
export class TimesPipe implements PipeTransform {
  /**
   * Transforms a number into an array of sequential integers `[0, 1, ..., n-1]`.
   *
   * @param value - The number of items to generate. Accepts `null` and `undefined`.
   * @returns An array of integers from `0` to `value - 1`, or an empty array for invalid input.
   */
  transform(value: number | undefined | null): number[] {
    const normalizedValue = minMax(0, Number.MAX_SAFE_INTEGER, Number.isNaN(value) ? 0 : Number(value));

    return Array.from({ length: normalizedValue }, (_, i) => i);
  }
}
