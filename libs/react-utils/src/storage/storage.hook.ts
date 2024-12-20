import type { ReactiveWebStorage } from "@thalesrc/reactive-storage/reactive-web-storage";
import { Context, useCallback, useContext, useMemo, useState } from "react";
import { useSubscribe } from "@thalesrc/react-utils/hooks/subscribe.hook";

export function useStorage<T>(context: Context<ReactiveWebStorage>, storeName: string, key: string, defaultValue?: T) {
  const store = useContext(context);
  const [value, stateSetter] = useState(defaultValue);
  const setter = useCallback((value: T) => {
    store.set(storeName, key, value);
  }, [store, storeName, key]);
  const operations = useMemo(() => ({
    patch: (value: Partial<T>) => store.patch(storeName, key, value),
    delete: () => store.delete(storeName, key),
    drop: (value: T) => store.drop(storeName, key, value),
    push: (value: T) => store.push(storeName, key, value),
  }), [store, storeName, key]);

  useSubscribe(store.get(storeName, key), value => { stateSetter(value as T); }, [store, storeName, key]);

  return useMemo(() => [value, setter, operations] as const, [value, setter, operations]);
}
