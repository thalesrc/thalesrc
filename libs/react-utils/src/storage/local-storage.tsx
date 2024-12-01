import { createContext, PropsWithChildren } from "react";
import { ReactiveWebLocalStorage } from "@thalesrc/reactive-storage/reactive-web-local-storage";
import type { ReactiveWebStorage } from "@thalesrc/reactive-storage/reactive-web-storage";
import { useConstant } from "@thalesrc/react-utils/hooks/constant.hook";
import { useStorage } from "@thalesrc/react-utils/storage/storage.hook";

import { StorageContextProps } from "./storage.type";

export const LocalStorageContext = createContext<ReactiveWebStorage>(null!);

export function LocalStorageContextProvider({ appName, children }: PropsWithChildren<StorageContextProps>) {
  const store = useConstant(() => new ReactiveWebLocalStorage(appName));

  return <LocalStorageContext.Provider value={store}>
    {children}
  </LocalStorageContext.Provider>;
}

export function useLocalStorage<T>(storeName: string, key: string, defaultValue?: T) {
  return useStorage(LocalStorageContext, storeName, key, defaultValue);
}
