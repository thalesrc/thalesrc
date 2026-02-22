import { inject, InjectionToken, Provider } from "@angular/core";
import { ReactiveWebSessionStorage } from '@thalesrc/reactive-storage';

import { StorageSignal, storageSignal } from "./storage";

const SESSION_STORAGE = new InjectionToken<ReactiveWebSessionStorage>('Telperion Session Storage');

export function provideSessionStorage(appName?: string): Provider {
  return {
    provide: SESSION_STORAGE,
    useValue: new ReactiveWebSessionStorage(appName)
  };
}

export function sessionStorageSignal<T>(store: string, key: string): StorageSignal<T> {
  const storage = inject(SESSION_STORAGE);

  return storageSignal(storage, store, key);
}
