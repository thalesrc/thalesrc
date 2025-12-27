import { signal } from "@lit-labs/signals";
import type { URLPattern } from "@thalesrc/extra-ts-types/polyfills/url-pattern";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A route definition element for client-side routing.
     * It contains a template with the content to render when the route is active.
     * The `path` attribute defines the URL pattern to match using URLPattern syntax.
     * Must be a child of a tha-router element.
     */
    "tha-route": ThaRoute;
  }
}

/**
 * Symbol used to access the route's template fragment signal.
 * @internal
 */
export const FRAGMENT = Symbol('ThaRoute:fragment');
/**
 * Symbol used to access the route's URLPattern instance.
 * @internal
 */
export const PATH_PATTERN = Symbol('ThaRoute:path-pattern');

/**
 * A custom element that defines a route in the router.
 *
 * Each route contains a template element with the content to render when
 * the route matches the current URL. The router watches for changes to
 * the template content and automatically updates the outlet.
 *
 * The `path` attribute uses URLPattern syntax and supports:
 * - Static paths: `/about`, `/users`
 * - Dynamic segments: `/users/:id`, `/posts/:category/:slug`
 * - Wildcards: `/blog/*`, `/docs/**`
 *
 * @example
 * ```html
 * <tha-router>
 *   <tha-route path="/">
 *     <template><h1>Home Page</h1></template>
 *   </tha-route>
 *   <tha-route path="/users/:id">
 *     <template><h1>User Profile</h1></template>
 *   </tha-route>
 *   <tha-router-outlet></tha-router-outlet>
 * </tha-router>
 * ```
 */
@customElement('tha-route')
export class ThaRoute extends LitElement {
  /**
   * Signal containing weak reference to the template's DocumentFragment.
   * Automatically updates when the template content changes.
   * @internal
   */
  [FRAGMENT] = signal<WeakRef<DocumentFragment> | null>(this.#getTemplateFragment());
  /**
   * URLPattern instance for matching the current URL against this route's path.
   * @internal
   */
  [PATH_PATTERN]: URLPattern | null = null;

  /**
   * The URL pattern to match for this route.
   * Uses URLPattern syntax with support for dynamic segments and wildcards.
   *
   * @attr path
   * @example "/users/:id"
   * @example "/blog/*"
   */
  @property({ type: String })
  path: string | null = null;

  /** Observes changes to child elements to detect template updates */
  #templateObserver = new MutationObserver(() => {
    this[FRAGMENT].set(this.#getTemplateFragment());
  });

  /**
   * Lifecycle callback when the element is connected to the DOM.
   * Sets up observer to watch for template content changes.
   */
  override connectedCallback(): void {
    super.connectedCallback();

    this.#templateObserver.observe(this, { childList: true });
  }

  /**
   * Lifecycle callback when an attribute changes.
   * Updates the URLPattern when the path attribute changes.
   *
   * @param name - The attribute name that changed
   * @param _old - The old attribute value
   * @param value - The new attribute value
   */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'path':
        this[PATH_PATTERN] = value ? new URLPattern({ pathname: value }) : null;
        break;
    }
  }

  /**
   * Extracts the DocumentFragment from the template element.
   * Returns a weak reference to prevent memory leaks.
   *
   * @returns Weak reference to the template fragment, or null if no template found
   */
  #getTemplateFragment(): WeakRef<DocumentFragment> | null {
    const template = this.querySelector('template');

    return template ? new WeakRef(template.content) : null;
  }

  /**
   * Lifecycle callback when the element is disconnected from the DOM.
   * Cleans up the template observer.
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#templateObserver.disconnect();
  }
}
