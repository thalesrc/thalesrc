import { call } from '@telperion/js-utils/function/call';

declare global {
  export interface FunctionConstructor {
    call: typeof call;
  }
}

Function.call = call;
