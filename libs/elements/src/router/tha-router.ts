import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ThaRoute } from "./tha-route";
import { computed, signal, Signal, SignalWatcher, watch,  } from '@lit-labs/signals';
import { RENDER_ROUTE, ThaRouterOutlet } from "./tha-router-outlet";
import { noop } from "@thalesrc/js-utils/function/noop";

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

  #updateEffectCleaner = noop;
  #routeEls = signal<WeakRef<ThaRoute>[]>([]);
  #activeRoute = computed(() => this.#routeEls.get()[0] ?? null);
  #outlet = signal<WeakRef<ThaRouterOutlet> | null>(null);

  constructor() {
    super();

    this.#routeChildObserver.observe(this, { childList: true});
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.#updateEffectCleaner = (this as any).updateEffect(() => {
      const activeRoute = this.#activeRoute.get()?.deref() ?? null;
      const outlet = this.#outlet.get()?.deref() ?? null;

      outlet?.[RENDER_ROUTE](activeRoute);
    });
  }

  // protected override render() {
  //   return html``;
  // }

  assignOutlet(outlet: ThaRouterOutlet | null) {
    this.#outlet.set(outlet ? new WeakRef(outlet) : null);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.#routeChildObserver.disconnect();
    this.#updateEffectCleaner();
  }

  protected override createRenderRoot() {
    return this;
  }
}
