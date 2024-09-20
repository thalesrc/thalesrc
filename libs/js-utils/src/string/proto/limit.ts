import type { Tail } from '@thalesrc/ts-utils/tail.type';

import { limit } from '../limit';

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
     * import "@thalesrc/js-utils/string/proto/limit";
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
