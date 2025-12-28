import { css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { PATH_PATTERN, ThaRoute } from "./tha-route";
import { signal } from '@lit-labs/signals';
import { RENDER_ROUTE, ThaRouterOutlet } from "./tha-router-outlet";
import { noop } from "@thalesrc/js-utils/function/noop";
import { Update } from 'history';
import { defer } from "@thalesrc/js-utils/function/defer";
import { SignalWatcherLitElement } from "./signal-watcher-lit-element";
import { HISTORY, HistoryManaged } from "./history-managed";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A router element that manages client-side routing for single-page applications.
     * It watches for navigation events and matches the current URL against registered routes
     * (tha-route elements), rendering the matching route's content in a tha-router-outlet element.
     * The `history` attribute specifies the history management strategy:
     * - 'browser' for HTML5 History API (default)
     * - 'hash' for hash-based routing
     * - 'memory' for in-memory history (testing)
     * - 'memory:name' for named memory history instances
     */
    "tha-router": ThaRouter;
  }
}

/**
 * A custom element that manages client-side routing for single-page applications.
 *
 * The router watches for navigation events and matches the current URL against
 * registered routes (tha-route elements), rendering the matching route's content
 * in a tha-router-outlet element.
 *
 * @example
 * ```html
 * <tha-router history="browser">
 *   <tha-route path="/">
 *     <template><h1>Home</h1></template>
 *   </tha-route>
 *   <tha-route path="/about">
 *     <template><h1>About</h1></template>
 *   </tha-route>
 *   <tha-router-outlet></tha-router-outlet>
 * </tha-router>
 * ```
 */
@customElement("tha-router")
export class ThaRouter extends HistoryManaged(SignalWatcherLitElement) {
  /**
   * Injects global styles for tha-router elements to hide non-outlet children.
   * Ensures that only tha-router-outlet elements are visible within the router.
   */
  static {
    const styleEl = document.createElement("style");

    styleEl.setAttribute("type", "text/css");
    styleEl.setAttribute("data-id", "tha-router-styles");
    styleEl.textContent = css`
      tha-router {
        & > :not(tha-router-outlet) {
          display: none;
        }
      }
    `.toString();
    document.head.appendChild(styleEl);
  }

  /**
   * Observes changes to child elements to detect when routes are added or removed.
   * Updates the #routeEls signal whenever tha-route children change.
   */
  #routeChildObserver = new MutationObserver((mutations) => {
    const childListMutations = mutations.filter(mutation => mutation.type === 'childList');

    if (!childListMutations.length) return;

    this.#routeEls.set(
      Array.from(this.children).filter(child => child instanceof ThaRoute).map(routeEl => new WeakRef(routeEl))
    );
  });

  /** Cleanup function for the route children rendering effect */
  #routeChildrenEffectCleaner = noop;
  /** Cleanup function for the history type change effect */
  #historyTypeEffectCleaner = noop;
  /** Cleanup function to remove history listener */
  #historyListenerRemover = noop;

  /** Signal containing weak references to all tha-route children */
  #routeEls = signal<WeakRef<ThaRoute>[]>([]);
  /** Signal containing weak reference to the currently active route */
  #activeRoute = signal<WeakRef<ThaRoute> | null>(null);
  /** Signal containing weak reference to the assigned outlet element */
  #outlet = signal<WeakRef<ThaRouterOutlet> | null>(null);

  /**
   * Lifecycle callback when the element is connected to the DOM.
   * Sets up observers, effects, and history listeners.
   */
  override connectedCallback(): void {
    super.connectedCallback();

    // Start observing child route elements
    this.#routeChildObserver.observe(this, { childList: true});

    // Effect to render the active route in the assigned outlet
    this.#routeChildrenEffectCleaner = this.updateEffect(() => {
      const activeRoute = this.#activeRoute.get()?.deref() ?? null;
      const outlet = this.#outlet.get()?.deref() ?? null;

      outlet?.[RENDER_ROUTE](activeRoute);
    });

    // Effect to handle history type changes
    this.#historyTypeEffectCleaner = this.updateEffect(() => {
      const history = this[HISTORY].get();

      this.#historyListenerRemover();

      this.#handleRouteChange({
        location: this[HISTORY].get()!.location,
        action: 'POP' as Update['action'],
      });

      // Set up listener for navigation events
      this.#historyListenerRemover = history ? history.listen(this.#handleRouteChange) : noop;
    });

    // Initial route matching on connect
    defer(() => {
      this.#handleRouteChange({
        location: this[HISTORY].get()!.location,
        action: 'POP' as Update['action'],
      });
    });
  }

  /**
   * Assigns a router outlet to this router.
   * The outlet will be used to render the active route's content.
   *
   * @param outlet - The outlet element to assign, or null to unassign
   * @internal
   */
  assignOutlet(outlet: ThaRouterOutlet | null) {
    this.#outlet.set(outlet ? new WeakRef(outlet) : null);
  }

  /**
   * Handles navigation events by matching the new URL against registered routes.
   * Updates the active route signal when a match is found.
   *
   * @param update - The history update containing the new location
   */
  #handleRouteChange = (update: Update) => {
    const routes = this.#routeEls.get()
      .map(weakRef => weakRef.deref()!)
      .filter(Boolean);

    for (const route of routes) {
      const pathPattern = route[PATH_PATTERN];
      if (pathPattern?.test({ pathname: update.location.pathname })) {
        this.#activeRoute.set(new WeakRef(route));
        return;
      }
    }
    this.#activeRoute.set(null);
  };

  /**
   * Lifecycle callback when the element is disconnected from the DOM.
   * Cleans up all observers, effects, and listeners.
   */
  override disconnectedCallback() {
    super.disconnectedCallback();

    try {
      this.#routeChildrenEffectCleaner();
      this.#historyTypeEffectCleaner();
    } catch { /* no-op */ }

    this.#routeChildObserver.disconnect();
    this.#historyListenerRemover();
  }

  /**
   * Creates the render root for the element.
   * Returns the element itself to render children in light DOM.
   *
   * @returns The element itself (not a shadow root)
   */
  protected override createRenderRoot() {
    return this;
  }
}
