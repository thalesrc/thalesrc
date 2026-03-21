import { effect, signal, Signal } from "@angular/core";
import { Observable } from "rxjs";

/**
 * Converts an Observable Signal into an Signal that updates with the latest emitted value.
 *
 * @param observable$ - The source Observable to convert
 * @param initialValue - The initial value for the Signal before the Observable emits
 * @returns A Signal that reflects the latest value emitted by the Observable
 */
export function observableSignalToSignal<T>(observable$: Signal<Observable<T>>, initialValue: T): Signal<T> {
  const source = signal<T>(initialValue);

  effect(onCleanup => {
    const subscription = observable$().subscribe(value => {
      source.set(value);
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return source;
}
