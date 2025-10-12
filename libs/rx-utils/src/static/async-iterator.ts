import { Observable } from "rxjs";

import { makeAsyncIterator } from "@thalesrc/rx-utils/to-async-iteratable";

declare module 'rxjs' {
  interface Observable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
  }
}

Observable.prototype[Symbol.asyncIterator] = function <T>(this: Observable<T>): AsyncIterator<T> {
  return makeAsyncIterator(this);
};
