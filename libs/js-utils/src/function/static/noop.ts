import { noop } from '@telperion/js-utils/function/noop';

declare global {
  export interface FunctionConstructor {
    /**
     * #### Noop function
     * * * *
     * Static usage example:
     * ```typescript
     * import "@telperion/js-utils/function/static/noop";
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
