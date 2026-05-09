import { Component, computed, contentChild, effect, input, signal } from "@angular/core";
import { NgModel, ValidationErrors, Validators } from "@angular/forms";
import { mergeWith } from "rxjs";

import { FocusWatcher } from "./focus-watchers";

@Component({
  selector: '',
  template: '',
})
export abstract class BaseFieldComponent {
  label = input("");
  hint = input("");
  child = contentChild(NgModel);
  childRequired = contentChild(NgModel, { read: Validators.required });
  focusWatcher = contentChild(FocusWatcher);

  errors = signal<ValidationErrors | null>(null);
  isPristine = signal(true);
  isTouched = signal(false);
  isRequired = signal(false);
  hasFocus = computed(() => this.focusWatcher()?.hasFocus() ?? false);

  constructor() {
    effect((cleanUp) => {
      const child = this.child();

      if (!child) {
        this.errors.set(null);
        this.isPristine.set(true);
        this.isTouched.set(false);
        this.isRequired.set(false);
        return;
      }

      const subs = child?.control.events.pipe(mergeWith(child?.control.statusChanges)).subscribe(() => {
        this.errors.set(child.control.errors);
        this.isPristine.set(child.control.pristine);
        this.isTouched.set(child.control.touched);
        this.isRequired.set(this.childRequired() !== null);
      });

      cleanUp(() => subs?.unsubscribe());
    })
  }
}
