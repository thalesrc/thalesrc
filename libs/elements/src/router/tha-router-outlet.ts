import { customElement, property } from "lit/decorators.js";
import type { ThaRouter } from "./tha-router";
import { FRAGMENT, ThaRoute } from "./tha-route";
import { computed, signal } from "@lit-labs/signals";
import { noop } from "@thalesrc/js-utils/function/noop";
import { SignalWatcherLitElement } from "./signal-watcher-lit-element";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * An outlet element that renders the active route's content from a tha-router.
     * It automatically binds to the nearest parent tha-router or to a specific router via the `for` attribute.
     * The outlet clones and renders the template content from the active tha-route element.
     * The `routePath` and `routeID` attributes reflect the current route's path and ID.
     */
    "tha-router-outlet": ThaRouterOutlet;
  }
}

/**
 * Symbol used by the router to call the internal render method on the outlet.
 * @internal
 */
export const RENDER_ROUTE = Symbol('ThaRouterOutlet:renderRoute');

/**
 * A custom element that serves as a rendering target for router content.
 *
 * The outlet automatically binds to its parent tha-router or to a specific router
 * identified by the `for` attribute. When the router's active route changes,
 * the outlet clones and renders the route's template content.
 *
 * @example
 * ```html
 * <tha-router>
 *   <tha-route path="/"><template><h1>Home</h1></template></tha-route>
 *   <tha-router-outlet></tha-router-outlet>
 * </tha-router>
 * ```
 *
 * @example
 * ```html
 * <!-- Bind to a specific router by ID -->
 * <tha-router id="main-router">
 *   <tha-route path="/"><template><h1>Home</h1></template></tha-route>
 * </tha-router>
 * <tha-router-outlet for="main-router"></tha-router-outlet>
 * ```
 */
@customElement("tha-router-outlet")
export class ThaRouterOutlet extends SignalWatcherLitElement {
  /** Weak reference to the bound router instance */
  #boundRouter: WeakRef<ThaRouter> | undefined;
  /** Signal containing weak reference to the route to render */
  #routeToRender = signal<WeakRef<ThaRoute> | null>(null);
  /** Computed signal that extracts the fragment from the route to render */
  #fragmentToRender = computed(() => this.#routeToRender.get()?.deref()?.[FRAGMENT].get() ?? null);
  /** Cleanup function for the fragment update effect */
  #fragmentUpdateCleaner = noop;
  /** Cleanup function for the attribute update effect */
  #attrUpdateCleaner = noop;

  /**
   * The ID of a specific tha-router element to bind to.
   * If not set, binds to the nearest parent tha-router.
   *
   * @attr for
   */
  @property({ type: String })
  for: string | null = null;

  /**
   * Reflects the path attribute of the currently active route.
   * Automatically updated when the active route changes.
   *
   * @attr routepath
   * @readonly
   */
  @property({ type: String, reflect: true })
  routePath: string | null = null;

  /**
   * Reflects the ID of the currently active route.
   * Automatically updated when the active route changes.
   *
   * @attr routeid
   * @readonly
   */
  @property({ type: String, reflect: true })
  routeID: string | undefined = undefined;

  /**
   * Lifecycle callback when the element is connected to the DOM.
   * Initializes the outlet and binds to a router.
   */
  override connectedCallback(): void {
    super.connectedCallback();

    this.#initialize();
  }

  /**
   * Initializes the outlet by binding to a router and setting up reactive effects.
   * Creates effects for rendering route content and updating reflected attributes.
   */
  #initialize() {
    this.bindToRouter();

    this.#fragmentUpdateCleaner = (this as any).updateEffect(() => {
      Array.from(this.renderRoot.children).forEach(child => child.remove());

      const fragment = this.#fragmentToRender.get()?.deref() ?? null;
      if (!fragment) return;

      this.renderRoot.appendChild(fragment.cloneNode(true));
    });

    this.#attrUpdateCleaner = (this as any).updateEffect(() => {
      const route = this.#routeToRender.get()?.deref() ?? null;
      this.routePath = route?.getAttribute('path') ?? null;
      this.routeID = route?.id ? route?.id : undefined;
    });
  }

  /**
   * Binds this outlet to a tha-router element.
   *
   * If no router is provided, automatically searches for one:
   * - If `for` attribute is set, finds router by ID in the same root
   * - Otherwise, finds the nearest parent tha-router
   *
   * Unbinds from the previous router if already bound to a different one.
   *
   * @param router - Optional router to bind to
   * @returns The bound router, or null if no router found
   */
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

  /**
   * Internal method called by the router to set the active route.
   * Updates the routeToRender signal which triggers re-rendering.
   *
   * @param route - The route to render, or null to clear
   * @internal
   */
  [RENDER_ROUTE](route: ThaRoute | null) {
    this.#routeToRender.set(route ? new WeakRef(route) : null);
  }

  /**
   * Lifecycle callback when the element is disconnected from the DOM.
   * Unbinds from the router and cleans up effects.
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#boundRouter?.deref()?.assignOutlet(null);

    try {
      this.#fragmentUpdateCleaner();
      this.#attrUpdateCleaner();
    } catch { /* no-op */ }
  }

  /**
   * Creates the render root for the element.
   * Returns the element itself to render content in light DOM.
   *
   * @returns The element itself (not a shadow root)
   */
  protected override createRenderRoot() {
    return this;
  }
}
