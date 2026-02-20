import { forwardRef, InjectionToken, Provider, Signal, Type } from "@angular/core";

export const FIELD_ACCESSOR = new InjectionToken<FieldAccessor<any>>("FieldAccessor");

export interface FieldAccessor<T> {
  defaultValue: Signal<T>;
}

export function provideFieldAccessor<T = any>(accessor: Type<FieldAccessor<T>>): Provider {
  return {
    provide: FIELD_ACCESSOR,
    useExisting: forwardRef(() => accessor)
  };
}
