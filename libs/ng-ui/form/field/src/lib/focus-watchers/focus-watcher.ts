import { Provider, Signal, Type } from "@angular/core";

export class FocusWatcher {
  hasFocus: Signal<boolean> = null!;
}

export function provideFocusWatcher(directive: Type<FocusWatcher>): Provider {
  return {
    provide: FocusWatcher,
    useExisting: directive
  };
}
