import { Component, computed, inject } from "@angular/core";

import { FieldService } from "./field.service";

@Component({
  selector: 'tui-field-info',
  template: `
    {{ showError() ? error() : hint() }}
  `,
  host: {
    "class": "text-xs flex items-center h-5 text-neutral",
    "[class.!text-danger]": "showError()",
  }
})
export class FieldInfoComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static errorMessageMapper(errorName: string, errorValue: any): string {
    switch (errorName) {
      case "required":
        return "This field is required";
      case "email":
        return "Please enter a valid email address";
      case "minlength":
        return `At least ${errorValue['requiredLength']} characters are required`;
      default:
        return `${errorName}: ${JSON.stringify(errorValue)}`;
    }
  }

  field = inject(FieldService);

  #firstError = computed(() => Object.entries(this.field.errors() ?? {})[0] ?? null);
  hint = this.field.hint;
  showError = computed(() => !this.field.isPristine() && this.field.errors());
  error = computed(() => {
    const [errorName, errorValue] = this.#firstError() ?? [];

    if (!errorName) return null;

    return FieldInfoComponent.errorMessageMapper(errorName, errorValue);
  });
}
