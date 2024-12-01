import { call } from '@thalesrc/js-utils/function/call';

declare global {
  export interface FunctionConstructor {
    call: typeof call;
  }
}

Function.call = call;
