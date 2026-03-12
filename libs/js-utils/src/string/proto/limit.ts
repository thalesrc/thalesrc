import type { Tail } from '@telperion/extra-ts-types';

import { limit } from '@telperion/js-utils/string/limit';

type FuncType = typeof limit;
type FuncArgs = Parameters<FuncType>;
type FuncReturn = ReturnType<FuncType>;
type ProtoArgs = Tail<FuncArgs>;

declare global {
  export interface String {
    /**
     * #### Limit
     *
     * Limits the string to `n` character
     *
     * * * *
     * Example:
     * ```typescript
     * import "@telperion/js-utils/string/proto/limit";
     *
     * const str = 'foobarbaz';
     *
     * str.limit(3); // 'foo'
     * ```
     * * * *
     * @param count Count to limit string character size
     * @return Limited string
     */
    limit(...args: ProtoArgs): FuncReturn;
  }
}

String.prototype.limit = function (this: string, ...args: ProtoArgs): FuncReturn {
  return limit(this, ...args);
};
