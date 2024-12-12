/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useRef } from "react";

export function useExistingPromiseCall<T = any, S = any, F extends (this: S, ...args: any[]) => T = any>(
  func: F,
  thisArg: S | null = null,
  args: Parameters<F> = [] as any
): () => Promise<T> {
  const ref = useRef<Promise<T>>(null);

  return useCallback(() => {
    if (!ref.current) {
      (ref as any).current = Promise.resolve().then(() => func.apply(thisArg!, args)).finally(() => {
        (ref as any).current = null;
      });
    }

    return ref.current!;
  }, [func, thisArg, args]);
}
