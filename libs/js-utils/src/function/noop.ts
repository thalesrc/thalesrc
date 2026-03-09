/**
 * #### Noop function
 * * * *
 * Example usage:
 * ```typescript
 * import { noop } from "@telperion/js-utils/function";
 *
 * noop();
 * document.onload = noop;
 * ```
 * Static usage example:
 * ```typescript
 * import "@telperion/js-utils/function/static/noop";
 *
 * Function.noop();
 * document.onload = Function.noop;
 * ```
 * * * *
 */
export function noop(): void {}
