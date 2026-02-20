import { Directive, signal } from "@angular/core";
import { form, FieldTree } from "@angular/forms/signals";
import { provideServiceDirective } from "@telperion/ng-pack/utils";
import { FormService } from "./form.service";

@Directive({
  selector: 'form[tsfForm]',
  providers: [provideServiceDirective(FormService, FormDirective)],
})
export class FormDirective {
  #formContent = signal({});
  #form = form(this.#formContent);

  constructor() {
    console.log('FormDirective initialized', this.#form());
  }

  insertField(path: string, defaultValue: any) {
    this.#formContent.update(content => ({ ...content, [path]: defaultValue }))
  }
}
