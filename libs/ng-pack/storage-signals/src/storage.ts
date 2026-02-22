import { WritableSignal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveStorage } from '@thalesrc/reactive-storage';

export interface StorageSignal<T> extends WritableSignal<T | null | undefined> {
  delete(): void;
}

export function storageSignal<T>(storage: ReactiveStorage, store: string, key: string): StorageSignal<T> {
  const source = toSignal(storage.get<T>(store, key));

  function setter(value: T | null | undefined) {
    storage.set(store, key, value);
  }

  function updater(updaterFn: (value: T | null | undefined) => T | null | undefined) {
    const currentValue = source();
    const newValue = updaterFn(currentValue);

    storage.set(store, key, newValue);
  }

  function deleter() {
    storage.delete(store, key);
  }

  return new Proxy(source as StorageSignal<T>, {
    apply() {
      return source();
    },
    get(target, prop, receiver) {
      switch (prop) {
        case 'set':
          return setter;
        case 'update':
          return updater;
        case 'delete':
          return deleter;
        default:
          return Reflect.get(target, prop, receiver);
      }
    }
  })
}
