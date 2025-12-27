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
  #fragmentUpdateCleaner = noop;
  #attrUpdateCleaner = noop;

  @property({ type: String })
  for: string | null = null;

  @property({ type: String, reflect: true })
  routePath: string | null = null;

  @property({ type: String, reflect: true })
  routeID: string | undefined = undefined;

  override connectedCallback(): void {
    super.connectedCallback();

    this.#initialize();
  }

  #initialize() {
    this.bindToRouter();

    this.#fragmentUpdateCleaner = (this as any).updateEffect(() => {
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

    this.#attrUpdateCleaner = (this as any).updateEffect(() => {
      const route = this.#routeToRender.get()?.deref() ?? null;
      this.routePath = route?.getAttribute('path') ?? null;
      this.routeID = route?.id ? route?.id : undefined;
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
    this.#routeToRender.set(route ? new WeakRef(route) : null);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#boundRouter?.deref()?.assignOutlet(null);

    try {
      this.#fragmentUpdateCleaner();
      this.#attrUpdateCleaner();
    } catch { /* no-op */ }
  }

  protected override createRenderRoot() {
    return this;
  }
}
