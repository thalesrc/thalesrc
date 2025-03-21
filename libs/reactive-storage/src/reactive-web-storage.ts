import { Subject } from 'rxjs';

import { ReactiveStorage, ReactiveStorageChangeEvent } from "./reactive-storage";
import { RegexParser } from './regex-parser';
import { toAsyncIterator } from './async-iterator.polyfill';

export abstract class AbstractReactiveWebStorage<S extends string = string> extends ReactiveStorage<S> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static JsonParse(string: string): any {
    try {
      return JSON.parse(string);
    } catch {
      return undefined!;
    }
  }

  protected abstract readonly appName: string;
  abstract readonly storage: Storage;

  get #keyNameRegex() {
    return RegexParser(`^${this.appName}\\/\\w+$`);
  }

  #changes$ = new Subject<ReactiveStorageChangeEvent<S>>();

	protected async [ReactiveStorage.Props.GET_ALL]() {
		const keys = Object.keys(this.storage).filter(key => this.#keyNameRegex.test(key));

    return Object.fromEntries(keys.map(key => [
      key.split('/')[1],
      AbstractReactiveWebStorage.JsonParse(this.storage.getItem(key)!)
    ]));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected [ReactiveStorage.Props.CHANGES] = (this.#changes$ as any)[Symbol.asyncIterator] ?? toAsyncIterator(this.#changes$);

	protected async [ReactiveStorage.Props.SET](storeName: S, value: unknown) {
    this.storage.setItem(`${this.appName}/${storeName}`, JSON.stringify(value));
    this.#changes$.next({ storeName, value });
	}

  protected async [ReactiveStorage.Props.REMOVE](storeName: S) {
    this.storage.removeItem(`${this.appName}/${storeName}`);
    this.#changes$.next({ storeName, value: undefined });
  }
}

export class ReactiveWebStorage<S extends string = string> extends AbstractReactiveWebStorage<S> {
  constructor(
    override readonly storage: Storage,
    override readonly appName = 'app',
  ) {
    super();
  }
}
