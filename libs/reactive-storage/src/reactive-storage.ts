/* eslint-disable @typescript-eslint/no-explicit-any */

import { Observable, distinctUntilChanged, firstValueFrom, from, lastValueFrom, map, startWith, switchMap, take } from "rxjs";
import { compact } from "@thalesrc/js-utils/array/compact";
import { remove } from "@thalesrc/js-utils/array/remove";
import { deepFreeze } from "@thalesrc/js-utils/object/deep-freeze";
import { shareLast } from "@thalesrc/rx-utils/operators/share-last";
import { FifoPromise } from "@thalesrc/ts-utils/fifo-promise";

const GET_ALL = Symbol('Reactive Storage Get All');
const CHANGES = Symbol('Reactive Storage Changes');
const SET = Symbol('Reactive Storage Set');
const REMOVE = Symbol('Reactive Storage Remove');

export interface ReactiveStorageChangeEvent<S = string> {
  storeName: S;
  value: any;
}

/**
 * Abstract base class for reactive storage implementations.
 * Provides RxJS-based reactive API for storage with support for nested property access.
 * All write operations are queued using FIFO promises to ensure consistency.
 *
 * @template S - Storage store name type (defaults to string)
 */
export abstract class ReactiveStorage<S extends string = string> {
  private static FifoGroup = Symbol();
  private static extractData<T = any>(data: any, prop: string = null!): T {
    if (!prop) return data;

    const fragments = compact(prop.split('.'));
    let value = data;

    do {
      try {
        value = value[fragments[0]];
      } catch {
        return undefined!;
      }

      fragments.shift();
    } while (fragments.length);

    return value;
  }

  static Props = { GET_ALL, CHANGES, SET, REMOVE } as const;

  protected abstract [GET_ALL](): Promise<any>;
  protected abstract [CHANGES]: AsyncGenerator<ReactiveStorageChangeEvent<S>>;
  protected abstract [SET](store: S, value: any): Promise<void>;
  protected abstract [REMOVE](store: S): Promise<void>;

  #_stream$: Observable<Readonly<Record<S, any>>> = null!;

  #initializeStream() {
    this.#_stream$ = from(this[GET_ALL]()).pipe(
      switchMap(data => {
        data ??= {};

        return from(this[CHANGES]).pipe(
          map(({ storeName, value }) => {
            if (value === undefined) delete data[storeName];
            else data[storeName] = value;

            return deepFreeze({ ...data });
          }),
          startWith(deepFreeze({ ...data }))
        );
      }),
      shareLast()
    );
  }

  get #stream$() {
    if (!this.#_stream$) this.#initializeStream();

    return this.#_stream$;
  }

  /**
   * Get an observable that emits the current value and all future changes.
   * Supports dot notation for nested property access (e.g., 'user.settings.theme').
   *
   * @template T - Expected return type
   * @param storeName - Name of the storage store
   * @param key - Property path using dot notation (empty string for entire store)
   * @returns Observable that emits current value and all updates
   */
  get<T = Record<string, any>>(storeName: S, key = ''): Observable<T> {
    return this.#stream$.pipe(
      map(allData => ReactiveStorage.extractData(allData, `${storeName}.${key}`)),
      distinctUntilChanged()
    );
  }

  async #set(storeName: S, key: string, value: any): Promise<void> {
    const store = await firstValueFrom(this.get(storeName));
    const storeChangeEvent = lastValueFrom(this.get(storeName).pipe(take(2)));
    const paths = compact(key.split('.'));

    if (!paths.length) {
      if (value === undefined) {
        await this[REMOVE](storeName);
      } else {
        await this[SET](storeName, value);
      }

      await storeChangeEvent;

      return;
    }

    const newStore = JSON.parse(JSON.stringify(typeof store === 'object' ? store : {}));
    let lastPiece = newStore;

    while (paths.length > 1) {
      if (typeof lastPiece[paths[0]] !== 'object') lastPiece[paths[0]] = {};

      lastPiece = lastPiece[paths[0]];
      paths.shift();
    }

    if (lastPiece[paths[0]] === value) return;

    if (value === undefined) {
      delete lastPiece[paths[0]];
    } else {
      lastPiece[paths[0]] = value;
    }

    await this[SET](storeName, newStore);
    await storeChangeEvent;

    return;
  }

  /**
   * Set a value in storage. Overwrites existing value.
   * Pass undefined as value to remove the property.
   *
   * @param storeName - Name of the storage store
   * @param key - Property path using dot notation
   * @param value - Value to set (undefined removes the value)
   */
  @FifoPromise({ group: ReactiveStorage.FifoGroup, timeout: 1000 })
  async set(storeName: S, key: string, value: any): Promise<void> {
    return await this.#set(storeName, key, value);
  }

  /**
   * Merge a partial object into existing value.
   * Only works with object values.
   *
   * @param storeName - Name of the storage store
   * @param key - Property path using dot notation
   * @param value - Partial object to merge with existing value
   */
  @FifoPromise({ group: ReactiveStorage.FifoGroup, timeout: 1000 })
  async patch(storeName: S, key: string, value: any): Promise<void> {
    const existing = await firstValueFrom(this.get<any[]>(storeName, key));

    await this.#set(storeName, key, Object.assign({}, existing, compact(value)));
  }

  /**
   * Delete a value from storage.
   *
   * @param storeName - Name of the storage store
   * @param key - Property path using dot notation (empty string deletes entire store)
   */
  @FifoPromise({ group: ReactiveStorage.FifoGroup, timeout: 1000 })
  async delete(storeName: S, key = ''): Promise<void> {
    return await this.#set(storeName, key, undefined);
  }

  /**
   * Add items to an array in storage.
   * Creates array if it doesn't exist.
   *
   * @param storeName - Name of the storage store
   * @param key - Path to array property using dot notation
   * @param values - Values to push into the array
   */
  @FifoPromise({ group: ReactiveStorage.FifoGroup, timeout: 1000 })
  async push(storeName: S, key: string, ...values: any[]): Promise<void> {
    const existing = await firstValueFrom(this.get<any[]>(storeName, key)) ?? [];

    await this.#set(storeName, key, [...existing, ...values]);
  }

  /**
   * Remove a specific value from an array in storage.
   *
   * @param storeName - Name of the storage store
   * @param key - Path to array property using dot notation
   * @param value - Value to remove from the array
   */
  @FifoPromise({ group: ReactiveStorage.FifoGroup, timeout: 1000 })
  async drop(storeName: S, key: string, value: any): Promise<void> {
    const existing = await firstValueFrom(this.get<any[]>(storeName, key));

    await this.#set(storeName, key, remove(existing, value));
  }
}
