import { AbstractReactiveWebStorage } from "./reactive-web-storage";

export class ReactiveWebSessionStorage<S extends string = string> extends AbstractReactiveWebStorage<S> {
  override readonly storage = window.sessionStorage;

  constructor(
    override readonly appName = 'app'
  ) {
    super();
  }
}
