import { inject, InjectionToken, Provider } from "@angular/core";
import { ReactiveWebLocalStorage } from '@thalesrc/reactive-storage';

import { StorageSignal, storageSignal } from "./storage";

const LOCAL_STORAGE = new InjectionToken<ReactiveWebLocalStorage>('Telperion Local Storage');

export function provideLocalStorage(appName?: string): Provider {
  return {
    provide: LOCAL_STORAGE,
    useValue: new ReactiveWebLocalStorage(appName)
  };
}

export function localStorageSignal<T>(store: string, key: string): StorageSignal<T> {
  const storage = inject(LOCAL_STORAGE);

  return storageSignal(storage, store, key);
}
