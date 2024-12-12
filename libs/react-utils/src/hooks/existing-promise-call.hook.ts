/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef } from "react";

export function useExistingPromiseCall<T = any, S = any, F extends (this: S, ...args: any[]) => T = any>(
  func: F,
  thisArg: S | null = null,
  args: Parameters<F> = [] as any): Promise<T> {
  const ref = useRef<Promise<T>>(null);

  (ref as any).current = ref.current || Promise.resolve().then(() => func.apply(thisArg!, args)).then(res => {
    (ref as any).current = null;

    return res;
  });

  return ref.current!;
}
