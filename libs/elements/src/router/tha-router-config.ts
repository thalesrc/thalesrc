import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DEFAULT_HISTORY_TYPE, GLOBAL_HISTORY_TYPE, HistoryType } from "./history";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A configuration element for setting global router defaults.
     * It allows configuring the default history management strategy for all routers
     * that don't specify their own history attribute.
     * The `history` attribute sets the global history type.
     */
    "tha-route-config": ThaRouterConfig;
  }
}

/**
 * A custom element for configuring global router settings.
 *
 * This element sets the default history management strategy for all routers
 * in the application that don't specify their own `history` attribute.
 * It updates the global history type which affects all routers using the default.
 *
 * Only one instance of this element should exist in the application.
 * **Recommended**: Place this element in the `<head>` section of your HTML
 * to ensure the configuration is applied before any routers are initialized.
 *
 * @example
 * ```html
 * <head>
 *   <!-- Set global history type to hash-based routing -->
 *   <tha-route-config history="hash"></tha-route-config>
 * </head>
 * <body>
 *   <!-- All routers without explicit history will use hash routing -->
 *   <tha-router>
 *     <tha-route path="/"><template><h1>Home</h1></template></tha-route>
 *     <tha-router-outlet></tha-router-outlet>
 *   </tha-router>
 * </body>
 * ```
 */
@customElement('tha-router-config')
export class ThaRouterConfig extends LitElement {
  /**
   * The global history management strategy to use.
   *
   * - `"browser"` - HTML5 History API (default)
   * - `"hash"` - Hash-based routing
   * - `"memory"` - In-memory history for testing
   * - `"memory:name"` - Named memory history instances
   *
   * Changes to this property update the global history type,
   * affecting all routers that don't specify their own history.
   *
   * @attr history
   */
  @property({ type: String })
  history: HistoryType = DEFAULT_HISTORY_TYPE;

  /**
   * Lifecycle callback when an attribute changes.
   * Updates the global history type when the history attribute changes.
   *
   * @param name - The attribute name that changed
   * @param _old - The old attribute value
   * @param value - The new attribute value
   */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'history':
        GLOBAL_HISTORY_TYPE.set(value as HistoryType || DEFAULT_HISTORY_TYPE);
        break;
    }
  }
}
