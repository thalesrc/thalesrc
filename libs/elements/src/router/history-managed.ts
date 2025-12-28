/**
 * @fileoverview History management mixin for Lit elements
 *
 * Provides a hierarchical history resolution system that allows components to:
 * - Define their own history strategy via the `history` attribute
 * - Inherit history from parent components (tha-router-config or tha-router-outlet)
 * - Fall back to global application history
 *
 * This enables flexible routing architectures including:
 * - Multiple isolated routers in the same application
 * - Nested routers with different history strategies
 * - Testing with memory history without affecting production code
 *
 * @module router/history-managed
 */

import { property } from "lit/decorators.js";
import { getHistoryByType, GLOBAL_HISTORY, GLOBAL_HISTORY_TYPE, HistoryType } from "./history";
import { computed, Signal, signal } from "@lit-labs/signals";
import { History } from "history";
import { LitElement } from "lit";

/**
 * Generic constructor type for mixin pattern.
 *
 * Used to type the base class parameter in the HistoryManaged mixin,
 * allowing it to extend any constructable class.
 *
 * @template T - The instance type of the class being constructed
 */
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Symbol key for accessing the resolved history instance.
 *
 * This symbol is used internally to access the computed history signal
 * without risking property name collisions. It provides a way for components
 * to access the resolved history instance regardless of how it was determined
 * (own, inherited, or global).
 *
 * The history signal automatically updates when the resolution changes,
 * triggering reactive updates in dependent code.
 *
 * @example Navigating programmatically
 * ```typescript
 * class MyRouter extends HistoryManaged(LitElement) {
 *   navigate(path: string) {
 *     const history = this[HISTORY].get();
 *     history.push(path);
 *   }
 * }
 * ```
 *
 * @example Listening to history changes
 * ```typescript
 * class MyRouter extends HistoryManaged(LitElement) {
 *   #unlisten?: () => void;
 *
 *   connectedCallback() {
 *     super.connectedCallback();
 *     const history = this[HISTORY].get();
 *     this.#unlisten = history.listen(({ location }) => {
 *       console.log('Route changed:', location.pathname);
 *       this.requestUpdate();
 *     });
 *   }
 *
 *   disconnectedCallback() {
 *     super.disconnectedCallback();
 *     this.#unlisten?.();
 *   }
 * }
 * ```
 */
export const HISTORY = Symbol('HistoryManaged:history');

/**
 * Symbol key for accessing the resolved history type.
 *
 * This symbol provides access to the computed history type signal,
 * which follows the same resolution order as HISTORY but returns
 * the type string instead of the history instance.
 *
 * Primarily used internally for history inheritance and debugging.
 *
 * @example Checking the resolved history type
 * ```typescript
 * class MyRouter extends HistoryManaged(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     const type = this[HISTORY_TYPE].get();
 *     console.log('Using history type:', type); // "browser", "hash", "memory", etc.
 *   }
 * }
 * ```
 */
export const HISTORY_TYPE = Symbol('HistoryManaged:historyType');

/**
 * Interface for Lit elements with history management capabilities.
 *
 * This interface defines the contract for elements that use the HistoryManaged mixin.
 * It provides reactive access to history instances through computed signals that
 * automatically resolve based on a hierarchical strategy.
 *
 * ## History Resolution Order
 *
 * The mixin resolves history using the following priority:
 *
 * 1. **Own History**: Element's own `history` attribute (if set)
 *    - Example: `<tha-router history="hash">...</tha-router>`
 *
 * 2. **Parent History**: Inherited from nearest ancestor with history
 *    - Searches up the DOM for `tha-router-config` or `tha-router-outlet`
 *    - Enables nested routing scenarios
 *
 * 3. **Global History**: Application-wide default
 *    - Configured once at app initialization
 *    - Typically "browser" for production, "memory" for tests
 *
 * ## Signal-Based Reactivity
 *
 * All history access is through Lit Signals, providing:
 * - Automatic updates when history source changes
 * - Efficient reactive propagation to dependent components
 * - Clean separation between history source and consumers
 *
 * @example Basic router with history listening
 * ```typescript
 * class ThaRouter extends HistoryManaged(LitElement) {
 *   #unlisten?: () => void;
 *
 *   connectedCallback() {
 *     super.connectedCallback();
 *     const history = this[HISTORY].get();
 *     this.#unlisten = history.listen(({ location }) => {
 *       console.log('Current path:', location.pathname);
 *       this.updateRoutes();
 *     });
 *   }
 *
 *   disconnectedCallback() {
 *     super.disconnectedCallback();
 *     this.#unlisten?.();
 *   }
 * }
 * ```
 *
 * @example Accessing history type
 * ```typescript
 * class ThaRouterLink extends HistoryManaged(LitElement) {
 *   handleClick(e: Event) {
 *     e.preventDefault();
 *     const history = this[HISTORY].get();
 *     const type = this[HISTORY_TYPE].get();
 *     console.log(`Navigating with ${type} history`);
 *     history.push(this.to);
 *   }
 * }
 * ```
 */
export interface HistoryManagedLitElementType {
  /**
   * The history management strategy for this element.
   *
   * This property determines how URL changes are managed and persisted.
   * When set, it overrides parent and global history settings.
   *
   * ## Available Strategies
   *
   * - **`"browser"`** - HTML5 History API
   *   - Clean URLs: `/products/123`
   *   - Requires server-side routing support
   *   - Best for production SPAs
   *
   * - **`"hash"`** - Hash-based routing
   *   - URLs: `/#/products/123`
   *   - Works without server configuration
   *   - Good for static hosting
   *
   * - **`"memory"`** - In-memory history
   *   - No URL changes visible
   *   - Perfect for testing
   *   - Isolated from browser history
   *
   * - **`"memory:name"`** - Named memory instance
   *   - Multiple isolated routers
   *   - Each name gets separate history
   *   - Example: `"memory:sidebar"`, `"memory:modal"`
   *
   * ## Inheritance
   *
   * If undefined, this element will:
   * 1. Search for nearest `tha-router-config` or `tha-router-outlet` ancestor
   * 2. Use that ancestor's history if found
   * 3. Otherwise, fall back to global application history
   *
   * @attr history
   * @type {HistoryType | undefined}
   */
  history: HistoryType | undefined;

  /**
   * Computed signal containing the resolved history type.
   *
   * This signal reactively resolves the history type using the hierarchy:
   * own → parent → global
   *
   * The signal automatically updates when:
   * - The element's `history` attribute changes
   * - The parent's history changes
   * - The global history type changes
   *
   * Used internally for history inheritance and can be accessed for debugging.
   *
   * @internal
   */
  [HISTORY_TYPE]: Signal.Computed<HistoryType | undefined>;

  /**
   * Computed signal containing the resolved history instance.
   *
   * This is the primary way components access history functionality.
   * The signal reactively resolves the history instance using the hierarchy:
   * own → parent → global
   *
   * The signal automatically updates when:
   * - The element's `history` attribute changes
   * - The element is moved in the DOM (parent changes)
   * - The parent's history changes
   * - The global history type changes
   *
   * Access via: `this[HISTORY].get()`
   *
   * @internal
   */
  [HISTORY]: Signal.Computed<History>;
}

/**
 * Mixin that adds hierarchical history management to Lit elements.
 *
 * This mixin provides a flexible, reactive history resolution system that enables:
 * - Elements to define their own history strategy
 * - History inheritance from parent components
 * - Global fallback history
 * - Multiple isolated routing contexts in one application
 *
 * ## Architecture
 *
 * The mixin uses Lit Signals (@lit-labs/signals) for reactive state management:
 *
 * 1. **Own History Signal**: Tracks the element's `history` attribute
 * 2. **Parent History Signal**: Computed from nearest ancestor with history
 * 3. **Resolved History Type**: Computed signal (own → parent → global)
 * 4. **Resolved History Instance**: Computed from the resolved type
 *
 * This creates a reactive chain where changes to any source automatically
 * propagate to all dependent components without manual subscription management.
 *
 * ## History Resolution Strategy
 *
 * ```
 * [Element's history attribute]
 *          ↓ (if undefined)
 * [Parent's history (tha-router-config/tha-router-outlet)]
 *          ↓ (if no parent)
 * [Global application history]
 * ```
 *
 * ## Usage Examples
 *
 * ### Basic Router Component
 *
 * ```typescript
 * @customElement('my-router')
 * class MyRouter extends HistoryManaged(LitElement) {
 *   #unlisten?: () => void;
 *
 *   connectedCallback() {
 *     super.connectedCallback();
 *
 *     // Access the resolved history instance
 *     const history = this[HISTORY].get();
 *
 *     // Listen for location changes
 *     this.#unlisten = history.listen(({ location, action }) => {
 *       console.log(`${action}: ${location.pathname}`);
 *       this.updateRoutes();
 *     });
 *   }
 *
 *   disconnectedCallback() {
 *     super.disconnectedCallback();
 *     this.#unlisten?.();
 *   }
 *
 *   private updateRoutes() {
 *     // Route matching logic
 *   }
 * }
 * ```
 *
 * ### Router Link Component
 *
 * ```typescript
 * @customElement('my-link')
 * class MyLink extends HistoryManaged(LitElement) {
 *   @property() to!: string;
 *
 *   render() {
 *     return html`
 *       <a href="${this.to}" @click="${this.handleClick}">
 *         <slot></slot>
 *       </a>
 *     `;
 *   }
 *
 *   private handleClick(e: Event) {
 *     e.preventDefault();
 *     const history = this[HISTORY].get();
 *     history.push(this.to);
 *   }
 * }
 * ```
 *
 * ### HTML Usage - Explicit History
 *
 * ```html
 * <!-- Use hash-based routing -->
 * <tha-router history="hash">
 *   <tha-route path="/home">
 *     <template><h1>Home</h1></template>
 *   </tha-route>
 * </tha-router>
 * ```
 *
 * ### HTML Usage - History Inheritance
 *
 * ```html
 * <!-- Configure history for all descendants -->
 * <tha-router-config history="memory:test">
 *   <!-- This router inherits memory:test -->
 *   <tha-router>
 *     <tha-route path="/page1">...</tha-route>
 *
 *     <!-- Nested outlet also inherits memory:test -->
 *     <tha-router-outlet>
 *       <tha-route path="/nested">...</tha-route>
 *     </tha-router-outlet>
 *   </tha-router>
 * </tha-router-config>
 * ```
 *
 * ### HTML Usage - Multiple Isolated Routers
 *
 * ```html
 * <div class="app">
 *   <!-- Sidebar with its own history -->
 *   <aside>
 *     <tha-router history="memory:sidebar">
 *       <tha-route path="/dashboard">...</tha-route>
 *       <tha-route path="/settings">...</tha-route>
 *     </tha-router>
 *   </aside>
 *
 *   <!-- Main content with independent history -->
 *   <main>
 *     <tha-router history="memory:main">
 *       <tha-route path="/home">...</tha-route>
 *       <tha-route path="/about">...</tha-route>
 *     </tha-router>
 *   </main>
 * </div>
 * ```
 *
 * ### Testing with Memory History
 *
 * ```typescript
 * import { setGlobalHistoryType } from './history';
 *
 * beforeEach(() => {
 *   // Use memory history for tests
 *   setGlobalHistoryType('memory');
 * });
 *
 * it('should navigate on link click', async () => {
 *   const router = await fixture<MyRouter>(html`
 *     <my-router>
 *       <tha-route path="/a"><template>Page A</template></tha-route>
 *       <tha-route path="/b"><template>Page B</template></tha-route>
 *       <my-link to="/b">Go to B</my-link>
 *     </my-router>
 *   `);
 *
 *   const link = router.querySelector('my-link')!;
 *   link.click();
 *
 *   await router.updateComplete;
 *   expect(router.textContent).to.include('Page B');
 * });
 * ```
 *
 * ## Benefits
 *
 * - **Flexibility**: Each router can use different history strategies
 * - **Testability**: Easy to test with memory history
 * - **Composition**: Nested routers inherit parent history naturally
 * - **Isolation**: Named memory histories prevent interference
 * - **Reactivity**: Automatic updates via Lit Signals
 *
 * @template T - Base class to extend (must extend LitElement)
 * @param superClass - The Lit element class to extend
 * @returns Extended class with history management capabilities
 */
export const HistoryManaged = <T extends Constructor<LitElement>>(superClass: T) => {
  class HistoryManagedLitElement extends superClass implements HistoryManagedLitElementType {
    /**
     * The history management strategy for this element.
     *
     * Defines how this element (and its descendants) manage URL routing.
     * Changes to this property trigger reactive updates throughout the
     * component hierarchy.
     *
     * ## Values
     *
     * - **`"browser"`** - HTML5 pushState/replaceState (clean URLs)
     * - **`"hash"`** - Hash-based routing (legacy support)
     * - **`"memory"`** - In-memory history (testing, no URL changes)
     * - **`"memory:name"`** - Named memory instance (isolation)
     *
     * ## Resolution
     *
     * When undefined:
     * 1. Searches for nearest `tha-router-config` or `tha-router-outlet`
     * 2. Inherits their history type if found
     * 3. Falls back to global application history
     *
     * @attr history
     * @type {HistoryType | undefined}
     */
    @property({ type: String })
    history: HistoryType | undefined = undefined;

    /**
     * Private signal tracking this element's own history type.
     * Updated whenever the `history` attribute changes.
     */
    #ownHistoryType = signal<HistoryType | undefined>(this.history);

    /**
     * Private computed signal that finds the parent's history type.
     * Searches up the DOM tree for the nearest tha-router-config or tha-router-outlet.
     * Returns undefined if no parent with history is found.
     */
    #parentHistoryType = computed(() => {
      const parent = this.closest('tha-router-config, tha-router-outlet') as HistoryManagedLitElementType | null;

      return parent?.[HISTORY_TYPE]?.get();
    });

    /**
     * Computed signal that resolves the active history type.
     *
     * Resolution chain:
     * 1. Own history type (from `history` attribute)
     * 2. Parent history type (from nearest ancestor)
     * 3. Global history type (application default)
     *
     * This signal automatically updates when any source in the chain changes,
     * triggering reactive updates in dependent components.
     *
     * @returns {HistoryType} The resolved history type ("browser", "hash", "memory", or "memory:name")
     */
    [HISTORY_TYPE] = computed(() => this.#ownHistoryType.get() ?? this.#parentHistoryType.get() ?? GLOBAL_HISTORY_TYPE.get());

    /**
     * Computed signal that resolves the active history instance.
     *
     * This is the primary interface for interacting with browser history.
     * It derives the history instance from the resolved history type,
     * following the same resolution chain:
     *
     * 1. Own history (from `history` attribute)
     * 2. Parent history (from nearest ancestor)
     * 3. Global history (application default)
     *
     * The signal automatically updates when:
     * - The element's `history` attribute changes
     * - The element is moved in the DOM (affecting parent resolution)
     * - The parent's history changes
     * - The global history type changes
     *
     * ## Usage
     *
     * ```typescript
     * const history = this[HISTORY].get();
     * history.push('/new-path');
     * history.listen(({ location }) => { ... });
     * ```
     *
     * @returns {History} The resolved history instance from the history library
     */
    [HISTORY] = computed(() => getHistoryByType(this[HISTORY_TYPE].get()!));

    /**
     * Lifecycle callback triggered when observed attributes change.
     *
     * This override handles the `history` attribute specifically:
     *
     * 1. Calls the parent class's implementation
     * 2. When `history` attribute changes, updates the `#ownHistoryType` signal
     * 3. The signal update cascades:
     *    - `[HISTORY_TYPE]` computed signal recalculates
     *    - `[HISTORY]` computed signal recalculates
     *    - All components using this element's history update reactively
     *
     * This ensures seamless runtime updates to history configuration:
     *
     * ```typescript
     * // Changing the attribute dynamically
     * router.setAttribute('history', 'hash');
     * // All child components immediately use hash history
     * ```
     *
     * @param name - The attribute name that changed
     * @param _old - Previous attribute value (unused)
     * @param value - New attribute value (will be cast to HistoryType)
     */
    override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
      super.attributeChangedCallback(name, _old, value);

      switch (name) {
        case 'history':
          this.#ownHistoryType.set(value as HistoryType | undefined);
          break;
      }
    }
  }

  return HistoryManagedLitElement as Constructor<HistoryManagedLitElementType> & T;
}
