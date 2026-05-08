import { isSignal, Signal } from "@angular/core";
import { toObservable as ngToObservable } from "@angular/core/rxjs-interop";
import { from, Observable, of } from "rxjs";

/**
 * Converts a value that can be a plain value, a Signal, a Promise, or an Observable into an Observable.
 * @param value The value to convert to an Observable.
 * @returns An Observable that emits the value.
 */
export function toObservable<T>(value: T | Signal<T> | Promise<T> | Observable<T>): Observable<T> {
  if (value instanceof Observable) return value;
  if (value instanceof Promise) return from(value);
  if (isSignal(value)) return ngToObservable(value);

  return of(value);
}
