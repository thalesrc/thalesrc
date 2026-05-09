import { Component } from "@angular/core";
import { provideServiceDirective } from "@telperion/ng-pack/utils";

import { BaseFieldComponent } from "./base-field.component";
import { FieldService } from "./field.service";
import { FieldInfoComponent } from "./info.component";

@Component({
  selector: "tui-field",
  imports: [FieldInfoComponent],
  providers: [provideServiceDirective(FieldService, FieldComponent)],
  styles: `
    @reference "../../../../style/tailwind-output.css";

    [field-input] {
      ::ng-deep {
        > [ngModel] {
          @apply border-none outline-none py-2 flex-1;
        }
      }
    }
  `,
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
        group-[.invalid]:border-danger group-[.invalid]:text-danger group-[.invalid.focused]:outline-danger">
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
