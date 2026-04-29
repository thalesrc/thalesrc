import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from "@angular/core";

/**
 * Context object exposed to templates rendered by {@link UnlessDirective}.
 *
 * The `$implicit` and `tngUnless` properties both expose the value of the
 * bound expression so it can be captured via `let` bindings in the template.
 */
export interface UnlessContext<T = unknown> {
  $implicit: T;
  tngUnless: T;
}

/**
 * Structural directive that renders its template when the bound expression
 * is **falsy** — the inverse of `*ngIf`.
 *
 * Optionally accepts an `else` template that is rendered when the expression
 * is truthy, mirroring the `ngIfElse` API.
 *
 * @example
 * ```html
 * <!-- Renders when `loading` is falsy -->
 * <p *tngUnless="loading">Content is ready</p>
 *
 * <!-- With an else template -->
 * <p *tngUnless="loading; else loadingTpl">Content is ready</p>
 * <ng-template #loadingTpl><p>Loading…</p></ng-template>
 * ```
 */
@Directive({
  selector: '[tngUnless]',
})
export class UnlessDirective<T = unknown> {
  #templateRef = inject<TemplateRef<UnlessContext<T>>>(TemplateRef);
  #viewContainer = inject(ViewContainerRef);

  /** Condition to evaluate. Template is rendered when the value is falsy. */
  tngUnless = input<T>();

  /** Template to render when the condition is truthy. */
  tngUnlessElse = input<TemplateRef<UnlessContext<T>> | null>(null);

  constructor() {
    effect(() => {
      const value = this.tngUnless() as T;
      const elseTemplate = this.tngUnlessElse();

      this.#viewContainer.clear();

      if (!value) {
        this.#viewContainer.createEmbeddedView(this.#templateRef, {
          $implicit: value,
          tngUnless: value,
        });
      } else if (elseTemplate) {
        this.#viewContainer.createEmbeddedView(elseTemplate, {
          $implicit: value,
          tngUnless: value,
        });
      }
    });
  }

  /** Type guard ensuring the directive's template context is well-typed. */
  static ngTemplateContextGuard<T>(
    _dir: UnlessDirective<T>,
    _ctx: unknown,
  ): _ctx is UnlessContext<T> {
    return true;
  }
}
