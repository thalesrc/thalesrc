import { buffer, debounceTime, OperatorFunction } from "rxjs";

/**
 * Buffers the source Observable values until `dueTime` has passed without another value being emitted.
 *
 * Collects values from the past as an array, and emits that array only when another value is emitted after a specified time span.
 *
 * @param dueTime The timeout duration in milliseconds (or the time unit determined by the scheduler's clock) for the window of time required to wait for emission silence before emitting the buffered array.
 * @returns An Observable that emits an array of values from the source Observable that were emitted within the specified time span.
 */
export function debounceTimeBuffer<T>(dueTime: number): OperatorFunction<T, T[]> {
  return source => {
    const notifier = source.pipe(debounceTime(dueTime));

    return source.pipe(buffer(notifier));
  }
}
