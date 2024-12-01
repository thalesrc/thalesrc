import { AbstractReactiveWebStorage } from "./reactive-web-storage";

export class ReactiveWebLocalStorage<S extends string = string> extends AbstractReactiveWebStorage<S> {
  override readonly storage = window.localStorage;

  constructor(
    override readonly appName = 'app'
  ) {
    super();
  }
}
