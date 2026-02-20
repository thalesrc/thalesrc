import { InjectionToken } from "@angular/core";

import type { FormDirective } from "./form.directive";

export const FormService = new InjectionToken<FormDirective>("FormService");
