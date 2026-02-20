import { forwardRef, InjectionToken, Provider, Type } from "@angular/core";

/**
 * Utility function to create a provider for a directive/component that can be injected as a service.
 * This is useful for cases where you want to inject a directive/component instance into another directive/component.
 *
 * Example usage:
 *
 * files:
 * - parent.directive.ts
 * - child.directive.ts
 * - parent.service.ts
 *
 * parent.service.ts:
 * ```
 * import { InjectionToken } from "@angular/core";
 * import type { ParentDirective } from "./parent.directive";
 *
 * export const ParentService = new InjectionToken<ParentDirective>("ParentService");
 * ```
 *
 * parent.directive.ts:
 * ```
 * @Directive({
 *   selector: 'parent',
 *   providers: [provideServiceDirective(ParentService, ParentDirective)],
 * })
 * export class ParentDirective {...}
 * ```
 * child.directive.ts:
 * ```
 * @Directive({
 *   selector: 'child',
 * })
 * export class ChildDirective {
 *   #parent = inject(ParentService);
 * }
 * ```
 *
 * @param token - The injection token to provide.
 * @param directive - The directive/component class that will be provided.
 * @returns A provider object that can be used in the providers array of an Angular module or component.
 */
export function provideServiceDirective<T extends Type<unknown>>(
  token: InjectionToken<T>,
  directive: T
): Provider {
  return {
    provide: token,
    useExisting: forwardRef(() => directive)
  }
}
