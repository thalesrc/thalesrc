import { noop } from '@thalesrc/js-utils/function/noop';

declare global {
  export interface FunctionConstructor {
    /**
     * #### Noop function
     * * * *
     * Static usage example:
     * ```typescript
     * import "@thalesrc/js-utils/function/static/noop";
     *
     * Function.noop();
     * document.onload = Function.noop;
     * ```
     * * * *
     */
    noop: typeof noop;
  }
}

Function.noop = noop;
