import { Directive, ElementRef, inject, signal, Signal } from "@angular/core";
import { FieldAccessor, provideFieldAccessor } from "../field-accessor";

@Directive({
  selector: "input[tsfField]",
  providers: [provideFieldAccessor(InputFieldAccessorDirective)],
})
export class InputFieldAccessorDirective implements FieldAccessor<string> {
  #elRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  defaultValue: Signal<string> = signal(this.#elRef.nativeElement.value);
}
