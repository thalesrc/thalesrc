/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useRef } from "react";

export function useExistingPromiseCall<F extends (this: any, ...args: any[]) => Promise<any>>(
  func: F,
  thisArg: ThisParameterType<F> | null = null,
  args: Parameters<F> = [] as any
) {
  const ref = useRef<ReturnType<F>>(null);

  return useCallback(() => {
    if (!ref.current) {
      (ref as any).current = Promise.resolve().then(() => func.apply(thisArg!, args)).finally(() => {
        (ref as any).current = null;
      });
    }

    return ref.current!;
  }, [func, thisArg, args]);
}
