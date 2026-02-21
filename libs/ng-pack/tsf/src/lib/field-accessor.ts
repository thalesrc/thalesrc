import { forwardRef, InjectionToken, Provider, Signal, Type } from "@angular/core";
import { Observable } from "rxjs";

export const FIELD_ACCESSOR = new InjectionToken<FieldAccessor<any>>("FieldAccessor");

export interface FieldAccessor<T> {
  defaultValue: Signal<T>;
  valueChange$: Observable<T>;
  writeValue(value: T): void;
}

export function provideFieldAccessor<T = any>(accessor: Type<FieldAccessor<T>>): Provider {
  return {
    provide: FIELD_ACCESSOR,
    useExisting: forwardRef(() => accessor)
  };
}
