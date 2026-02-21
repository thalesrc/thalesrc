import { Directive, signal } from "@angular/core";
import { form } from "@angular/forms/signals";
import { provideServiceDirective } from "@telperion/ng-pack/utils";
import { FormService, UPSERT_FIELD } from "./form.service";

@Directive({
  selector: 'form[tsfForm]',
  providers: [provideServiceDirective(FormService, FormDirective)],
  exportAs: 'tsfForm',
})
export class FormDirective {
  #formContent = signal({} as Record<string, unknown>);
  form = form(this.#formContent);

  [UPSERT_FIELD](name: string, value: unknown) {
    this.#formContent.update(content => ({ ...content, [name]: value }));
  }
}
