import { css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ThaRoute } from "./tha-route";
import { computed, signal, SignalWatcher } from '@lit-labs/signals';
import { RENDER_ROUTE, ThaRouterOutlet } from "./tha-router-outlet";
import { noop } from "@thalesrc/js-utils/function/noop";
import { History, Update } from 'history';
import { getHistoryByType, GLOBAL_HISTORY_TYPE, HistoryType } from "./history";

declare global {
  interface HTMLElementTagNameMap {
    "tha-router": ThaRouter;
  }
}

@customElement("tha-router")
export class ThaRouter extends (SignalWatcher(LitElement) as typeof LitElement) {
  static {
    const styleEl = document.createElement("style");

    styleEl.setAttribute("type", "text/css");
    styleEl.setAttribute("data-id", "tha-router-styles");
    styleEl.textContent = css`
      tha-router {
        background-color: red;

        & > :not(tha-router-outlet) {
          display: none;
        }
      }
    `.toString();
    document.head.appendChild(styleEl);
  }

  #routeChildObserver = new MutationObserver((mutations) => {
    const childListMutations = mutations.filter(mutation => mutation.type === 'childList');

    if (!childListMutations.length) return;

    this.#routeEls.set(
      Array.from(this.children).filter(child => child instanceof ThaRoute).map(routeEl => new WeakRef(routeEl))
    );
  });

  #routeChildrenEffectCleaner = noop;
  #historyTypeEffectCleaner = noop;
  #historyListenerRemover = noop;
  #globalHistoryEffectCleaner = noop;

  #history = signal<History | null>(null);
  #routeEls = signal<WeakRef<ThaRoute>[]>([]);
  #activeRoute = computed(() => this.#routeEls.get()[0] ?? null);
  #outlet = signal<WeakRef<ThaRouterOutlet> | null>(null);

  @property({ type: String })
  history: HistoryType | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    this.#routeChildObserver.observe(this, { childList: true});

    this.#routeChildrenEffectCleaner = (this as any).updateEffect(() => {
      const activeRoute = this.#activeRoute.get()?.deref() ?? null;
      const outlet = this.#outlet.get()?.deref() ?? null;

      outlet?.[RENDER_ROUTE](activeRoute);
    });

    this.#globalHistoryEffectCleaner = (this as any).updateEffect(() => {
      GLOBAL_HISTORY_TYPE.get();

      this.#handleRoutingStrategyChange(this.history);
    });

    this.#historyTypeEffectCleaner = (this as any).updateEffect(() => {
      const history = this.#history.get();

      this.#historyListenerRemover();

      this.#historyListenerRemover = history ? history.listen(this.#handleRouteChange) : noop;
    });
  }

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'history':
        this.#handleRoutingStrategyChange(value as HistoryType | null);
        break;
    }
  }

  assignOutlet(outlet: ThaRouterOutlet | null) {
    this.#outlet.set(outlet ? new WeakRef(outlet) : null);
  }

  #handleRoutingStrategyChange(value: HistoryType | null) {
    if (!value) {
      value = GLOBAL_HISTORY_TYPE.get();
    }

    this.#history.set(getHistoryByType(value));
  }

  #handleRouteChange = (update: Update) => {
    const searcher = URLPattern;
  };

  override disconnectedCallback() {
    super.disconnectedCallback();

    try {
      this.#routeChildrenEffectCleaner();
      this.#historyTypeEffectCleaner();
      this.#globalHistoryEffectCleaner();
    } catch { /* no-op */ }

    this.#routeChildObserver.disconnect();
    this.#historyListenerRemover();
  }

  protected override createRenderRoot() {
    return this;
  }
}
