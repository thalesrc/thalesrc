import { isSignal, signal, Signal } from "@angular/core";

/**
 * Ensures that a value is wrapped in an Angular Signal. If the input is already a Signal, it is returned as-is; otherwise, it is wrapped in a new Signal.
 *
 * This utility is useful for normalizing inputs that may be either static values or reactive Signals, allowing downstream code to work with a consistent reactive interface.
 */
export function signalize<T>(value: T | Signal<T>): Signal<T> {
  return isSignal(value) ? value : signal(value);
}
