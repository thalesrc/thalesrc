import type { ReactiveWebStorage } from "@thalesrc/reactive-storage/reactive-web-storage";
import { Context, useCallback, useContext, useMemo, useState } from "react";
import { useSubscribe } from "@thalesrc/react-utils/hooks/subscribe.hook";

export function useStorage<T>(context: Context<ReactiveWebStorage>, key: string, defaultValue?: T) {
  const store = useContext(context);
  const [value, stateSetter] = useState(defaultValue);
  const setter = useCallback((value: T) => {
    store.set('root', key, value);
  }, [store, key]);

  useSubscribe(store.get('root', key), value => { stateSetter(value as T); }, [store, key]);

  return useMemo(() => [value, setter] as const, [value, setter]);
}
