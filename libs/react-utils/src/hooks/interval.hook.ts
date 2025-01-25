import { EffectCallback, useEffect } from "react";

/**
 * Hook to run a callback at a fixed interval.
 *
 * @param time The interval time in milliseconds
 * @param callback The callback to run
 */
export function useInterval(time: number, callback: EffectCallback) {
  useEffect(() => {
    const id = setInterval(callback, time);

    return () => clearInterval(id);
  }, [callback, time]);
}
