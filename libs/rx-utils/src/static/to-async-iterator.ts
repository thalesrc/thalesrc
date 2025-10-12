import { Observable } from "rxjs";

import { toAsyncIterator } from "@thalesrc/rx-utils/to-async-iterator";

declare module 'rxjs' {
  interface Observable<T> {
    [Symbol.asyncIterator](): AsyncIterable<T>;
  }
}

Observable.prototype[Symbol.asyncIterator] = function <T>(this: Observable<T>): AsyncIterable<T> {
  return toAsyncIterator(this);
}
