import { Component } from "@angular/core";
import { provideServiceDirective } from "@telperion/ng-pack/utils";

import { BaseFieldComponent } from "./base-field.component";
import { FieldService } from "./field.service";
import { FieldInfoComponent } from "./info.component";

@Component({
  selector: "tui-field",
  imports: [FieldInfoComponent],
  providers: [provideServiceDirective(FieldService, FieldComponent)],
  template: `
    <fieldset class="flex flex-col gap-1">
      <legend class="text-sm font-medium mb-1">
        {{ label() }}
        @if (isRequired()) {
          <span class="text-secondary">*</span>
        }
      </legend>
      <div field-input class="
        flex bg-white rounded-md border border-neutral outline outline-transparent transition
        group-[.focused]:outline-secondary group-[.focused]:border-secondary
        group-[.invalid]:border-danger group-[.invalid]:text-danger group-[.invalid.focused]:outline-danger
        *:[[ngModel]]:border-none *:[[ngModel]]:outline-none *:[[ngModel]]:w-full *:[[ngModel]]:py-2 *:[[ngModel]]:flex-1
        ">
        <ng-content></ng-content>
      </div>
    </fieldset>
    <tui-field-info></tui-field-info>
  `,
  host: {
    "class": "block group",
    "[class.invalid]": "!isPristine() && errors()",
    "[class.focused]": "hasFocus()"
  }
})
export class FieldComponent extends BaseFieldComponent { }
