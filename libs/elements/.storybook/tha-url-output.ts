import { customElement } from "lit/decorators.js";
import { html, signal, watch } from "@lit-labs/signals";
import { HISTORY, HistoryManaged } from "../src/router/history-managed";
import { SignalWatcherLitElement } from "../src/router/signal-watcher-lit-element";
import { noop } from "@thalesrc/js-utils/function/noop";

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
  #historyChangeUnsubscribe = noop;
  #historyEventsUnsubscribe = noop;

  #browserUrl = signal(location.href);
  #historyUrl = signal(this[HISTORY].get()!.location.pathname + this[HISTORY].get()!.location.search + this[HISTORY].get()!.location.hash);

  override connectedCallback(): void {
    super.connectedCallback();

    addEventListener('popstate', this.#onLocationChange);
    addEventListener('pushstate', this.#onLocationChange);
    addEventListener('hashchange', this.#onLocationChange);

    this.#historyChangeUnsubscribe = this.updateEffect(() => {
      const history = this[HISTORY].get();

      this.#historyUrl.set(history.location.pathname + history.location.search + history.location.hash);

      this.#historyEventsUnsubscribe();
      this.#historyEventsUnsubscribe = history.listen(({ location }) => {
        this.#historyUrl.set(location.pathname + location.search + location.hash);
      });
    })
  }

  protected override render() {
    return html`
      <div>
        <strong>History URL:</strong> ${this.#historyUrl}
      </div>
      <div>
        <strong>Browser URL:</strong> ${this.#browserUrl}
      </div>
    `;
  }

  #onLocationChange = () => {
    this.#browserUrl.set(window.location.href);
  };

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    removeEventListener('popstate', this.#onLocationChange);
    removeEventListener('pushstate', this.#onLocationChange);
    removeEventListener('hashchange', this.#onLocationChange);

    this.#historyEventsUnsubscribe();

    try {
      this.#historyChangeUnsubscribe();
    } catch {}
  }
}
