import { property } from "lit/decorators.js";
import { getHistoryByType, GLOBAL_HISTORY, HistoryType } from "./history";
import { computed, Signal, signal } from "@lit-labs/signals";
import { History } from "history";
import { LitElement } from "lit";

/**
 * Constructor type for creating class instances.
 * @template T - The type being constructed
 */
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Symbol key for accessing the internal history signal.
 *
 * This symbol prevents property name collisions while allowing
 * components to access each other's history instances for inheritance.
 *
 * @example
 * ```typescript
 * class MyRouter extends HistoryManaged(LitElement) {
 *   navigate(path: string) {
 *     const history = this[HISTORY].get();
 *     history.push(path);
 *   }
 * }
 * ```
 */
export const HISTORY = Symbol('HistoryManaged:history');

/**
 * Interface for elements that manage browser history.
 *
 * Components implementing this interface can define their own history strategy,
 * inherit history from parent components, or fall back to global history.
 *
 * ## History Resolution Order
 *
 * 1. **Own History**: If the element has a `history` attribute set
 * 2. **Parent History**: Searches for nearest `tha-router-config` or `tha-router-outlet`
 * 3. **Global History**: Falls back to application-wide default
 *
 * @example
 * ```typescript
 * class MyRouter extends HistoryManaged(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     const history = this[HISTORY].get();
 *     history.listen(({ location }) => {
 *       console.log('Location:', location.pathname);
 *     });
 *   }
 * }
 * ```
 */
export interface HistoryManagedLitElementType {
  /**
   * The history management strategy to use.
   *
   * - `"browser"` - HTML5 History API (clean URLs like `/path`)
   * - `"hash"` - Hash-based routing (URLs like `/#/path`)
   * - `"memory"` - In-memory history (no URL changes, for testing)
   * - `"memory:name"` - Named memory instance (for component isolation)
   *
   * If undefined, inherits from parent or uses global default.
   */
  history: HistoryType | undefined;

  /**
   * Computed signal containing the resolved history instance.
   *
   * Resolution order: own → parent → global
   *
   * @internal
   */
  [HISTORY]: Signal.Computed<History>;
}

/**
 * Mixin that adds history management capabilities to Lit elements.
 *
 * This mixin implements a hierarchical history resolution system that allows
 * components to define their own history strategy, inherit from parents, or
 * use a global default.
 *
 * ## How It Works
 *
 * The mixin uses Lit Signals for reactive history management:
 * - **Own History**: Tracks this element's `history` attribute
 * - **Parent History**: Searches DOM for parent with history
 * - **Computed History**: Returns first available: own → parent → global
 *
 * ## Usage Examples
 *
 * ### Basic Router
 *
 * ```typescript
 * class ThaRouter extends HistoryManaged(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     const history = this[HISTORY].get();
 *     this.unlisten = history.listen(() => this.updateRoutes());
 *   }
 * }
 * ```
 *
 * ### With Custom History
 *
 * ```html
 * <tha-router history="hash">
 *   <tha-route path="/home">...</tha-route>
 * </tha-router>
 * ```
 *
 * ### Inheriting from Parent
 *
 * ```html
 * <tha-router-config history="memory:test">
 *  <tha-router>
 *    <!-- Inherits memory:test from config -->
 *  </tha-router>
 * </tha-router-config>
 * ```
 *
 * ### Multiple Isolated Routers
 *
 * ```html
 * <tha-router history="memory:sidebar">...</tha-router>
 * <tha-router history="memory:main">...</tha-router>
 * ```
 *
 * @template T - Base class to extend (must be LitElement)
 * @param superClass - The Lit element class to extend
 * @returns Extended class with history management
 */
export const HistoryManaged = <T extends Constructor<LitElement>>(superClass: T) => {
  class HistoryManagedLitElement extends superClass implements HistoryManagedLitElementType {
    /**
     * The history management strategy to use.
     *
     * - `"browser"` - HTML5 History API (default)
     * - `"hash"` - Hash-based routing
     * - `"memory"` - In-memory history for testing
     * - `"memory:name"` - Named memory history for isolation
     *
     * If not set, uses the global history type.
     *
     * @attr history
     */
    @property({ type: String })
    history: HistoryType | undefined = undefined;

    /**
     * Signal for this element's own history instance (if history attribute is set).
     * Stores the History object created from the `history` attribute value.
     * @private
     */
    #ownHistory = signal<History | undefined>(this.history ? getHistoryByType(this.history) : undefined);

    /**
     * Computed signal that searches for and returns the nearest parent's history.
     * Looks for `tha-router-config` or `tha-router-outlet` ancestors.
     * @private
     */
    #parentHistory = computed(() => {
      const parent = this.closest('tha-router-config, tha-router-outlet') as HistoryManagedLitElementType | null;

      return parent?.[HISTORY]?.get();
    });

    /**
     * Computed signal that resolves the active history instance.
     *
     * Resolution order:
     * 1. Own history (from `history` attribute)
     * 2. Parent history (from nearest ancestor)
     * 3. Global history (application default)
     *
     * This signal automatically updates when any source changes.
     */
    [HISTORY] = computed(() => this.#ownHistory.get() ?? this.#parentHistory.get() ?? GLOBAL_HISTORY.get());

    /**
     * Handles attribute changes, specifically for the `history` attribute.
     *
     * When the `history` attribute changes:
     * - Updates the `#ownHistory` signal with the new History instance
     * - This triggers the `[HISTORY]` computed signal to update
     * - All dependent components reactively receive the new history
     *
     * @param name - The attribute name that changed
     * @param _old - Previous attribute value (unused)
     * @param value - New attribute value
     */
    override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
      super.attributeChangedCallback(name, _old, value);

      switch (name) {
        case 'history':
          this.#ownHistory.set(value ? getHistoryByType(value as HistoryType) : undefined);
          break;
      }
    }
  }

  return HistoryManagedLitElement as Constructor<HistoryManagedLitElementType> & T;
}
