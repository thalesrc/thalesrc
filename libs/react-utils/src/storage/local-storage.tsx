import { createContext, PropsWithChildren } from "react";
import { ReactiveWebLocalStorage } from "@thalesrc/reactive-storage/reactive-web-local-storage";
import type { ReactiveWebStorage } from "@thalesrc/reactive-storage/reactive-web-storage";
import { useConstant } from "@thalesrc/react-utils/hooks/constant.hook";

import { StorageContextProps } from "./storage.type";
import { useStorage } from "./storage.hook";

export const LocalStorageContext = createContext<ReactiveWebStorage>(null!);

export function LocalStorageContextProvider({ appName, children }: PropsWithChildren<StorageContextProps>) {
  const store = useConstant(() => new ReactiveWebLocalStorage(appName));

  return <LocalStorageContext.Provider value={store}>
    {children}
  </LocalStorageContext.Provider>;
}

export function useLocalStorage<T>(key: string, defaultValue?: T) {
  return useStorage(LocalStorageContext, key, defaultValue);
}
