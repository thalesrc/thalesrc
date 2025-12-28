import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { computed, signal } from "@lit-labs/signals";
import { compact } from '@thalesrc/js-utils/array/compact';
import { noop } from "@thalesrc/js-utils/function/noop";
import { HISTORY, HistoryManaged } from "./history-managed";
import { SignalWatcherLitElement } from "./signal-watcher-lit-element";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A navigation link element for client-side routing.
     * It handles click events to navigate using the History API without full page reloads.
     * The `to` attribute specifies the navigation target (absolute, relative, or 'back'/'forward').
     * The `active` attribute reflects whether the link matches the current route.
     * The `history` attribute specifies which history instance to use.
     */
    "tha-router-link": ThaRouterLink;
  }
}

/** Navigation symbols for browser history operations */
type LinkSymbol = 'back' | 'forward';
/** Absolute path starting with / */
type AbsolutePath = '/' | `/${string}`;
/** Relative path starting with ./ or ../ */
type RelativePath = './' | `./${string}` | `../${string}`;
/** Union of all supported link types */
type LinkType = LinkSymbol | AbsolutePath | RelativePath;

/**
 * A custom element that provides navigation links for client-side routing.
 *
 * The link handles click events to navigate using the History API, preventing
 * full page reloads. It supports absolute paths, relative paths, and special
 * symbols ('back', 'forward') for browser history navigation.
 *
 * The `active` attribute automatically reflects whether the link's path
 * matches the current route, useful for styling active navigation items.
 *
 * @example
 * ```html
 * <!-- Absolute path -->
 * <tha-router-link to="/about">About</tha-router-link>
 *
 * <!-- Relative path -->
 * <tha-router-link to="./details">Details</tha-router-link>
 * <tha-router-link to="../users">Back to Users</tha-router-link>
 *
 * <!-- History navigation -->
 * <tha-router-link to="back">← Back</tha-router-link>
 * <tha-router-link to="forward">Forward →</tha-router-link>
 * ```
 */
@customElement("tha-router-link")
export class ThaRouterLink extends HistoryManaged(SignalWatcherLitElement) {
  /** Regular expression pattern to validate relative paths */
  #relativeLinkPattern = /^((\.\.\/)+([^.\/].*)?|\.\/[^.\/].*|\.\.)$/i;

  /**
   * The navigation target. Can be:
   * - Absolute path: `/users`, `/about`
   * - Relative path: `./details`, `../users`
   * - History symbol: `back`, `forward`
   *
   * @attr to
   */
  @property({ type: String })
  to: LinkType | null = null;

  /**
   * Reflects whether this link matches the current route.
   * Automatically updated when the route changes.
   *
   * @attr active
   * @readonly
   */
  @property({ type: Boolean, reflect: true })
  active = false;

  /** Cleanup function for the active state effect */
  #activeStateEffectCleaner = noop;
  /** Cleanup function to remove history listener */
  #historyListenerRemover = noop;

  /** Signal containing the current 'to' value */
  #to = signal<LinkType | null>(null);
  /** Computed URLPattern for matching against the current route */
  #urlPattern = computed(() => {
    const to = this.#to.get();
    if (!to || to === 'back' || to === 'forward') return null;

    try {
      return new URLPattern({ pathname: to });
    } catch {
      return null;
    }
  });

  /**
   * Lifecycle callback when the element is connected to the DOM.
   * Sets up click listener and active state tracking effect.
   */
  override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('click', this.#handleClick);

    this.#activeStateEffectCleaner = (this as any).updateEffect(() => {
      const history = this[HISTORY].get();
      const pattern = this.#urlPattern.get();

      this.active = pattern?.test({ pathname: history?.location.pathname ?? '' }) ?? false;

      this.#historyListenerRemover = history?.listen(() => {
        this.active = pattern?.test({ pathname: history.location.pathname }) ?? false;
      }) ?? noop;
    });
  }

  /**
   * Lifecycle callback when an attribute changes.
   * Updates signals when history or to attributes change.
   *
   * @param name - The attribute name that changed
   * @param _old - The old attribute value
   * @param value - The new attribute value
   */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'to':
        this.#to.set(value as LinkType | null);
        break;
    }
  }

  /**
   * Handles click events to perform navigation.
   *
   * - For 'back'/'forward', calls the corresponding history method
   * - For relative paths, resolves them against the current location
   * - For absolute paths, navigates directly
   *
   * Prevents default link behavior to avoid full page reloads.
   *
   * @param event - The click event
   */
  #handleClick = (event: MouseEvent) => {
    const history = this[HISTORY].get();

    if (this.to === 'back') return history.back();
    if (this.to === 'forward') return history.forward();

    const currentPath = history.location.pathname + history.location.search + history.location.hash;

    let link = this.to;
    if (this.#relativeLinkPattern.test(link ?? '')) {
      const segments = compact(currentPath.split('/'));
      const linkSegments = compact(link!.split('/'));

      for (const segment of linkSegments) {
        if (segment === '..') {
          segments.pop();
        } else if (segment !== '.') {
          segments.push(segment);
        }
      }

      link = '/' + segments.join('/');
    }

    link = link?.replaceAll('//', '/') as '/';

    this[HISTORY].get()?.push(link || '/');
  };

  /**
   * Lifecycle callback when the element is disconnected from the DOM.
   * Cleans up effects, listeners, and event handlers.
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    try {
      this.#activeStateEffectCleaner();
    } catch {}

    this.#historyListenerRemover();
    this.removeEventListener('click', this.#handleClick);
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
