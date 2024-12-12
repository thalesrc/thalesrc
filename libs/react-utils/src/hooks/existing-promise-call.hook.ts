/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useRef } from "react";

export function useExistingPromiseCall<T = any, S = any, F extends (this: S, ...args: any[]) => T = any>(
  func: F,
  thisArg: S | null = null,
  args: Parameters<F> = [] as any
): () => Promise<T> {
  const ref = useRef<() => Promise<T>>(null);
  const caller = useCallback(() => Promise.resolve().then(() => func.apply(thisArg!, args)).then(res => {
    (ref as any).current = null;

    return res;
  }), [func, thisArg, args]);

  (ref as any).current = ref.current ?? caller;

  return ref.current!;
}
