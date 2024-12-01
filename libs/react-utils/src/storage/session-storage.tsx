import { createContext, PropsWithChildren } from "react";
import { ReactiveWebSessionStorage } from "@thalesrc/reactive-storage/reactive-web-session-storage";
import type { ReactiveWebStorage } from "@thalesrc/reactive-storage/reactive-web-storage";
import { useConstant } from "@thalesrc/react-utils/hooks/constant.hook";

import { StorageContextProps } from "./storage.type";
import { useStorage } from "@thalesrc/react-utils/storage/storage.hook";

export const SessionStorageContext = createContext<ReactiveWebStorage>(null!);

export function SessionStorageContextProvider({ appName, children }: PropsWithChildren<StorageContextProps>) {
  const store = useConstant(() => new ReactiveWebSessionStorage(appName));

  return <SessionStorageContext.Provider value={store}>
    {children}
  </SessionStorageContext.Provider>;
}

export function useSessionStorage<T>(key: string, defaultValue?: T) {
  return useStorage(SessionStorageContext, key, defaultValue);
}
