import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ThaRouter } from "./tha-router";
import { FRAGMENT, ThaRoute } from "./tha-route";
import { computed, signal, SignalWatcher } from "@lit-labs/signals";
import { noop } from "@thalesrc/js-utils/function/noop";

export const RENDER_ROUTE = Symbol('ThaRouterOutlet:renderRoute');

@customElement("tha-router-outlet")
export class ThaRouterOutlet extends (SignalWatcher(LitElement) as typeof LitElement) {
  #boundRouter: WeakRef<ThaRouter> | undefined;
  #routeToRender = signal<WeakRef<ThaRoute> | null>(null);
  #fragmentMap = new WeakMap<DocumentFragment, Node>();
  #fragmentToRender = computed(() => this.#routeToRender.get()?.deref()?.[FRAGMENT].get() ?? null);
  #updateEffectCleaner = noop;

  @property({ type: String })
  for: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    this.#initialize();
  }

  #initialize() {
    this.bindToRouter();

    this.#updateEffectCleaner = (this as any).updateEffect(() => {
      Array.from(this.renderRoot.children).forEach(child => this.renderRoot.removeChild(child));

      const fragment = this.#fragmentToRender.get()?.deref() ?? null;

      if (!fragment) return;

      let node = this.#fragmentMap.get(fragment);

      if (!node) {
        node = fragment.cloneNode(true);
        this.#fragmentMap.set(fragment, node);
      }

      this.renderRoot.appendChild(node);
    });
  }

  bindToRouter(): ThaRouter | null;
  bindToRouter(router?: ThaRouter): ThaRouter | null {
    if (!router) {
      if (this.for) {
        const root = this.getRootNode() as Document | ShadowRoot;
        router = root.querySelector(`tha-router#${this.for}`) as ThaRouter ?? undefined;
      } else {
        router = this.closest('tha-router') ?? undefined;
      }
    }

    const prevRouter = this.#boundRouter?.deref() ?? null;

    if (prevRouter === router) return prevRouter;

    prevRouter?.assignOutlet(null);
    router?.assignOutlet(this);
    this.#boundRouter = router ? new WeakRef(router) : undefined;

    return router ?? null;
  }

  [RENDER_ROUTE](route: ThaRoute | null) {
    console.log('tha-router-outlet rendering route:', route);
    this.#routeToRender.set(route ? new WeakRef(route) : null);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#boundRouter?.deref()?.assignOutlet(null);
    this.#updateEffectCleaner();
  }

  protected override createRenderRoot() {
    return this;
  }
}
