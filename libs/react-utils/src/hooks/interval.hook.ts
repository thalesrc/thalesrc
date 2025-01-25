import { EffectCallback, useEffect } from "react";

/**
 * Hook to run a callback at a fixed interval.
 *
 * @param time The interval time in milliseconds
 * @param callback The callback to run
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInterval(time: number, callback: EffectCallback, deps: any[] = []) {
  useEffect(() => {
    const id = setInterval(callback, time);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, ...deps]);
}
