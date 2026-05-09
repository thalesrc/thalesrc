import { InjectionToken } from "@angular/core";

import type { BaseFieldComponent } from "./base-field.component";

export const FieldService = new InjectionToken<BaseFieldComponent>("FieldService");
