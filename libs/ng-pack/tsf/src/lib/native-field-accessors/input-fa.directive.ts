import { Directive, ElementRef, inject, signal, Signal } from "@angular/core";
import { FieldAccessor, provideFieldAccessor } from "../field-accessor";
import { Subject } from "rxjs";

@Directive({
  selector: "input[tsfField]",
  providers: [provideFieldAccessor(InputFieldAccessorDirective)],
  host: {
    '(input)': '_handleInput()',
  }
})
export class InputFieldAccessorDirective implements FieldAccessor<string> {
  #elRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  #valueChange$ = new Subject<string>();

  defaultValue: Signal<string> = signal(this.#elRef.nativeElement.value);
  valueChange$ = this.#valueChange$.asObservable();

  _handleInput() {
    this.#valueChange$.next(this.#elRef.nativeElement.value);
  }

  writeValue(value: string): void {
    this.#elRef.nativeElement.value = value;
  }
}
