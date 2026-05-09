import { Directive, signal } from "@angular/core";

import { FocusWatcher, provideFocusWatcher } from "./focus-watcher";

@Directive({
  selector: 'input,textarea',
  providers: [provideFocusWatcher(InputFocusWatcherDirective)],
  host: {
    "(focus)": "hasFocus.set(true)",
    "(blur)": "hasFocus.set(false)"
  }
})
export class InputFocusWatcherDirective implements FocusWatcher {
  hasFocus = signal(false);
}
