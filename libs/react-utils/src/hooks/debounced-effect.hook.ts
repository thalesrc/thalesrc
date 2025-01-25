import { useEffect, DependencyList, EffectCallback } from "react";
import { debounceWithKey } from "@thalesrc/js-utils/function/debounce";
import { useConstant } from "@thalesrc/react-utils/hooks/constant.hook";

/**
 * Hook that runs an effect debounced.
 *
 * @param effect Effect to run.
 * @param deps Dependencies to watch.
 * @param time Delay for the debounce.
 */
export function useDebouncedEffect(effect: EffectCallback, deps: DependencyList, time = 180) {
  const key = useConstant(() => Symbol());

  useEffect(() => {
    const debouncedEffect = debounceWithKey(key, effect, time);

    return () => {
      debouncedEffect.then((dest) => dest?.());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
