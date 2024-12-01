import { ReactiveWebStorage } from "./reactive-web-storage";

export class ReactiveWebLocalStorage<S extends string = string> extends ReactiveWebStorage<S> {
  override readonly storage = window.sessionStorage;

  constructor(
    override readonly appName = 'app'
  ) {
    super();
  }
}
