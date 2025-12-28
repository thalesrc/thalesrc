import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { GLOBAL_HISTORY_TYPE } from "./history";
import { HISTORY_TYPE, HistoryManaged } from "./history-managed";
import { SignalWatcherLitElement } from "./signal-watcher-lit-element";
import { noop } from "@thalesrc/js-utils/function/noop";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A configuration element for managing router history settings.
     *
     * Behavior depends on placement:
     * - **In `<head>`**: Sets global history for all routers
     * - **In `<body>`**: Provides local history for descendant routers
     */
    "tha-router-config": ThaRouterConfig;
  }
}

/**
 * A custom element for configuring router history settings.
 *
 * This element serves dual purposes depending on its placement in the DOM:
 *
 * ## Global Configuration (placed in `<head>`)
 *
 * When placed in the `<head>` element, it sets the **global default history**
 * for all routers in the application that don't specify their own history or
 * inherit from a parent.
 *
 * ```html
 * <head>
 *   <!-- All routers will use hash routing by default -->
 *   <tha-router-config history="hash"></tha-router-config>
 * </head>
 * <body>
 *   <tha-router>
 *     <!-- Uses hash history (global default) -->
 *     <tha-route path="/home">...</tha-route>
 *   </tha-router>
 * </body>
 * ```
 *
 * ## Local Configuration (placed in `<body>`)
 *
 * When placed in the `<body>` element, it provides history configuration
 * for its **descendant routers only**. This allows different sections of
 * your application to use different history strategies.
 *
 * ```html
 * <body>
 *   <!-- Section 1: Hash routing -->
 *   <tha-router-config history="hash">
 *     <tha-router>
 *       <!-- Uses hash history from parent config -->
 *       <tha-route path="/dashboard">...</tha-route>
 *     </tha-router>
 *   </tha-router-config>
 *
 *   <!-- Section 2: Memory routing (isolated) -->
 *   <tha-router-config history="memory">
 *     <tha-router>
 *       <!-- Uses memory history from parent config -->
 *       <tha-route path="/preview">...</tha-route>
 *     </tha-router>
 *   </tha-router-config>
 * </body>
 * ```
 *
 * ## Usage Patterns
 *
 * ### Set Global Default
 *
 * Place in `<head>` to configure all routers:
 *
 * ```html
 * <!DOCTYPE html>
 * <html>
 *   <head>
 *     <tha-router-config history="browser"></tha-router-config>
 *   </head>
 *   <body>
 *     <!-- All routers use browser history -->
 *   </body>
 * </html>
 * ```
 *
 * ### Override for Specific Section
 *
 * Use local config to override global default:
 *
 * ```html
 * <head>
 *   <!-- Global: browser history -->
 *   <tha-router-config history="browser"></tha-router-config>
 * </head>
 * <body>
 *   <!-- Main app uses browser history -->
 *   <tha-router>...</tha-router>
 *
 *   <!-- Admin section uses hash history -->
 *   <tha-router-config history="hash">
 *     <tha-router>...</tha-router>
 *   </tha-router-config>
 * </body>
 * ```
 *
 * ### Isolate Components with Memory History
 *
 * Use named memory history for component isolation:
 *
 * ```html
 * <body>
 *   <!-- Each component has independent navigation -->
 *   <tha-router-config history="memory:component1">
 *     <my-widget>
 *       <tha-router>...</tha-router>
 *     </my-widget>
 *   </tha-router-config>
 *
 *   <tha-router-config history="memory:component2">
 *     <my-widget>
 *       <tha-router>...</tha-router>
 *     </my-widget>
 *   </tha-router-config>
 * </body>
 * ```
 *
 * ### Testing with Memory History
 *
 * Use memory history to avoid affecting browser URL during tests:
 *
 * ```typescript
 * import { fixture, html } from '@open-wc/testing';
 *
 * it('should navigate', async () => {
 *   const el = await fixture(html`
 *     <tha-router-config history="memory:test">
 *       <tha-router>
 *         <tha-route path="/test">Test Page</tha-route>
 *       </tha-router>
 *     </tha-router-config>
 *   `);
 *
 *   // Test navigation without affecting browser URL
 * });
 * ```
 *
 * ## History Resolution
 *
 * Router components resolve their history in this order:
 *
 * 1. **Own `history` attribute** (highest priority)
 * 2. **Parent `tha-router-config`** (local configuration)
 * 3. **Global `tha-router-config`** (in `<head>`)
 * 4. **Default** (`"browser"`)
 *
 * ## Best Practices
 *
 * ✅ **DO**: Place one `tha-router-config` in `<head>` for global settings
 *
 * ```html
 * <head>
 *   <tha-router-config history="browser"></tha-router-config>
 * </head>
 * ```
 *
 * ✅ **DO**: Use local configs for sections with different routing needs
 *
 * ```html
 * <tha-router-config history="memory">
 *   <component-preview>...</component-preview>
 * </tha-router-config>
 * ```
 *
 * ✅ **DO**: Use named memory history for isolated components
 *
 * ```html
 * <tha-router-config history="memory:sidebar">
 *   <sidebar-nav>...</sidebar-nav>
 * </tha-router-config>
 * ```
 *
 * ❌ **DON'T**: Place multiple configs in `<head>` (last one wins)
 *
 * ```html
 * <head>
 *   <tha-router-config history="browser"></tha-router-config>
 *   <tha-router-config history="hash"></tha-router-config> <!-- Overrides above -->
 * </head>
 * ```
 *
 * ❌ **DON'T**: Nest configs unnecessarily (inner configs take precedence)
 *
 * ```html
 * <tha-router-config history="browser">
 *   <tha-router-config history="hash">
 *     <!-- Uses hash, not browser -->
 *   </tha-router-config>
 * </tha-router-config>
 * ```
 */
@customElement('tha-router-config')
export class ThaRouterConfig extends HistoryManaged(SignalWatcherLitElement) {
  /**
   * Cleanup function for the global history effect.
   * Only used when the element is placed in `<head>`.
   * @private
   */
  #globalHistoryUnsubscribe = noop;

  /**
   * Called when the element is connected to the DOM.
   *
   * - If in `<head>`: Sets up a reactive effect to update global history
   * - If in `<body>`: Only provides history to descendants (no special setup)
   */
  override connectedCallback(): void {
    super.connectedCallback();

    if (!document.head.contains(this)) return;

    console.log('ThaRouterConfig: Setting global history type to', this[HISTORY_TYPE].get());

    // Set the global history type when this element is connected in <head>
    this.#globalHistoryUnsubscribe = this.updateEffect(() => {
      GLOBAL_HISTORY_TYPE.set(this[HISTORY_TYPE].get()!);
    });
  }

  /**
   * Called when the element is disconnected from the DOM.
   *
   * Cleans up the global history effect if it was set up.
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    try {
      this.#globalHistoryUnsubscribe();
    } catch {}
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
