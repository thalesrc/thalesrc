import { customElement } from "lit/decorators.js";
import { computed, html, signal } from "@lit-labs/signals";
import { HISTORY, HistoryManaged } from "../src/router/history-managed";
import { SignalWatcherLitElement } from "../src/router/signal-watcher-lit-element";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A debugging component that displays the current history URL and the actual browser URL.
     * Useful for understanding the difference between router state and browser location.
     */
    "tha-url-output": ThaUrlOutput;
  }
}

/**
 * A custom element for displaying router history URL and actual browser URL.
 *
 * This component is useful for debugging and demonstrations to visualize:
 * - The URL from the router's history object (pathname + search + hash)
 * - The actual browser window URL (from window.location)
 *
 * This helps understand the difference between router-managed navigation
 * (especially with memory or hash history) and the browser's actual location.
 *
 * @example
 * ```html
 * <!-- Show URLs for browser history -->
 * <tha-url-output history="browser"></tha-url-output>
 *
 * <!-- Show URLs for hash history -->
 * <tha-url-output history="hash"></tha-url-output>
 *
 * <!-- Show URLs for memory history (browser URL won't change) -->
 * <tha-url-output history="memory"></tha-url-output>
 * ```
 */
@customElement('tha-url-output')
export class ThaUrlOutput extends HistoryManaged(SignalWatcherLitElement) {
  #browserUrl = signal(window.location.href);
  #historyUrl = computed(() => {
    const history = this[HISTORY].get();
    const { pathname, search, hash } = history.location;

    return `${pathname}${search}${hash}`;
  });

  override connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener('popstate', this.#onLocationChange);
    window.addEventListener('hashchange', this.#onLocationChange);
  }

  protected override render() {
    return html`
      <div>
        <strong>History URL:</strong> ${this.#historyUrl.get()}
      </div>
      <div>
        <strong>Browser URL:</strong> ${this.#browserUrl.get()}
      </div>
    `;
  }

  #onLocationChange = () => {
    this.#browserUrl.set(window.location.href);
  };

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener('popstate', this.#onLocationChange);
    window.removeEventListener('hashchange', this.#onLocationChange);
  }
}
