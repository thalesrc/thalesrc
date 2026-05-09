import { Component } from "@angular/core";
import { provideServiceDirective } from "@telperion/ng-pack/utils";

import { BaseFieldComponent } from "./base-field.component";
import { FieldService } from "./field.service";
import { FieldInfoComponent } from "./info.component";

@Component({
  selector: "tui-check-field",
  imports: [FieldInfoComponent],
  providers: [provideServiceDirective(FieldService, CheckFieldComponent)],
  styles: `
    @reference "../../../../style/tailwind-output.css";
  `,
  template: `
    <label class="flex items-center gap-1 cursor-pointer">
      <ng-content></ng-content>
      @if (isRequired()) {
        <span class="text-secondary">*</span>
      }
    </label>
    <tui-field-info></tui-field-info>
  `,
  host: {
    "class": "group",
    "[class.invalid]": "!isPristine() && errors()"
  }
})
export class CheckFieldComponent extends BaseFieldComponent {
}
