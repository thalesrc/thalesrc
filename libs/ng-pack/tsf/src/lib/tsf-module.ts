import { NgModule } from '@angular/core';
import { FormDirective } from './form.directive';
import { FieldDirective } from './field.directive';
import { NATIVE_FIELD_ACCESSORS } from './native-field-accessors';

const DIRECTIVES = [
  ...NATIVE_FIELD_ACCESSORS,
  FormDirective,
  FieldDirective
];

@NgModule({
  imports: [...DIRECTIVES],
  exports: [...DIRECTIVES],
})
export class TsfModule {}
