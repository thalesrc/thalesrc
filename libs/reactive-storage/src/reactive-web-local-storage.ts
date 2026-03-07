import { AbstractReactiveWebStorage } from "./reactive-web-storage";

/**
 * Reactive wrapper for browser localStorage.
 * Data persists across browser sessions.
 *
 * @template S - Storage store name type
 */
export class ReactiveWebLocalStorage<S extends string = string> extends AbstractReactiveWebStorage<S> {
  override readonly storage = window.localStorage;

  constructor(
    override readonly appName = 'app'
  ) {
    super();
  }
}
