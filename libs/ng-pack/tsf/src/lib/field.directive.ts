import { Directive, effect, inject, input } from "@angular/core";
import { FormService } from "./form.service";
import { FIELD_ACCESSOR } from "./field-accessor";

@Directive({
  selector: "[tsfField]",
})
export class FieldDirective {
  #form = inject(FormService);
  #accessor = inject(FIELD_ACCESSOR);

  name = input.required<string>();
  defaultValue = input(null);

  constructor() {
    effect(() => {
      const fieldName = this.name();
      const defaultValue = this.defaultValue() ?? this.#accessor.defaultValue();
      console.log(`Inserting field with name: ${fieldName} and default value: ${defaultValue}`);
      this.#form.insertField(fieldName, defaultValue);
    })
  }
}
