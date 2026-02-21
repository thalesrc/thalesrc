import { Directive, signal } from "@angular/core";
import { form, PathKind, required, SchemaPathTree } from "@angular/forms/signals";
import { provideServiceDirective } from "@telperion/ng-pack/utils";
import { FormService, UPSERT_FIELD } from "./form.service";

@Directive({
  selector: 'form[tsfForm]',
  providers: [provideServiceDirective(FormService, FormDirective)],
  exportAs: 'tsfForm',
})
export class FormDirective {
  #formContent = signal({} as Record<string, unknown>);
  #schema: SchemaPathTree<Record<string, unknown>, PathKind.Root> = null!;

  form = form(this.#formContent, schema => {
    this.#schema = schema;
  });

  constructor() {
    setTimeout(() => {
      required(this.#schema['firstname'] as SchemaPathTree<Record<string, unknown>, PathKind.Root>, {message: 'First name is required'});
    }, 5000);
  }

  [UPSERT_FIELD](name: string, value: unknown) {
    this.#formContent.update(content => ({ ...content, [name]: value }));

    return this.#schema;
  }
}
