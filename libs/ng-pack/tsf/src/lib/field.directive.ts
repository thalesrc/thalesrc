import { computed, Directive, effect, forwardRef, inject, InjectionToken, input, Signal, signal } from "@angular/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldTree } from "@angular/forms/signals";

import { FormService, UPSERT_FIELD } from "./form.service";
import { FIELD_ACCESSOR } from "./field-accessor";

const FIELD = new InjectionToken<FieldDirective>('FIELD_TREE');
const UPSERT_SUB_FIELD = Symbol('TSF/FIELD/UPSERT_SUB_FIELD');

@Directive({
  selector: "[tsfField]",
  providers: [
    { provide: FIELD, useExisting: forwardRef(() => FieldDirective) },
  ],
  exportAs: 'tsfField',
})
export class FieldDirective {
  #form = inject(FormService);
  #field = inject(FIELD, {skipSelf: true, optional: true});
  #accessor = inject(FIELD_ACCESSOR);

  name = input.required<string>();
  fieldDefaultValue = input(null, { alias: 'defaultValue'});
  #computedDefaultValue = computed(() => this.fieldDefaultValue() ?? this.#accessor.defaultValue() ?? null);

  #childTree = signal(null as Record<string, unknown> | null);

  fieldTree: Signal<FieldTree<unknown>> = computed(() => this.#field ? this.#field.fieldTree() : this.#form.form[this.name()] as FieldTree<unknown>);

  value = computed(() => this.fieldTree()().value());

  constructor() {
    effect(() => {
      if (this.#field) {
        this.#field[UPSERT_SUB_FIELD](this.name(), this.#childTree() ?? this.#computedDefaultValue());
      } else {
        this.#form[UPSERT_FIELD](this.name(), this.#childTree() ?? this.#computedDefaultValue());
      }
    });

    effect(() => {
      this.#accessor.writeValue(this.value());
    });

    this.#accessor.valueChange$.pipe(takeUntilDestroyed()).subscribe(value => {
      this.setValue(value);
    });
  }

  [UPSERT_SUB_FIELD](path: string, defaultValue: any) {
    this.#childTree.update(tree => ({ ...(tree ?? {}), [path]: defaultValue }))
  }

  setValue(value: unknown) {
    this.fieldTree()().value.set(value);
  }
}
