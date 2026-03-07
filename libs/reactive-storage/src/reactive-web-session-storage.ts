import { AbstractReactiveWebStorage } from "./reactive-web-storage";

/**
 * Reactive wrapper for browser sessionStorage.
 * Data is cleared when the browser tab is closed.
 *
 * @template S - Storage store name type
 */
export class ReactiveWebSessionStorage<S extends string = string> extends AbstractReactiveWebStorage<S> {
  override readonly storage = window.sessionStorage;

  constructor(
    override readonly appName = 'app'
  ) {
    super();
  }
}
