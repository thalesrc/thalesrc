/**
 * @fileoverview Router parameter display component
 *
 * Provides a declarative way to display dynamic route parameter values
 * directly in HTML templates without requiring JavaScript.
 *
 * @module router/tha-router-param
 */

import { customElement, property } from "lit/decorators.js";
import { SignalWatcherLitElement } from "./signal-watcher-lit-element";
import { computed, html, signal } from "@lit-labs/signals";
import { PARAMS, type ThaRouterOutlet } from "./tha-router-outlet";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A component that displays the value of a route parameter.
     *
     * Must be used within a tha-router-outlet element. Automatically
     * updates when route parameters change.
     */
    'tha-router-param': ThaRouterParam;
  }
}

/**
 * Custom element for displaying dynamic route parameter values.
 *
 * This component provides a declarative way to access and display URL
 * parameters extracted from dynamic route segments without writing JavaScript.
 * It must be used inside a `<tha-router-outlet>` element.
 *
 * ## Features
 *
 * - **Declarative**: Access params directly in HTML
 * - **Reactive**: Automatically updates when route changes
 * - **Hierarchical**: Inherits params from parent outlets
 * - **Type-safe**: Integrated with TypeScript definitions
 *
 * ## Usage
 *
 * ### Basic Parameter Display
 *
 * ```html
 * <tha-router>
 *   <tha-route path="/users/:id">
 *     <template>
 *       <h1>User Profile</h1>
 *       <p>User ID: <tha-router-param name="id"></tha-router-param></p>
 *     </template>
 *   </tha-route>
 *   <tha-router-outlet></tha-router-outlet>
 * </tha-router>
 * ```
 *
 * When navigating to `/users/123`, the component renders: `User ID: 123`
 *
 * ### Multiple Parameters
 *
 * ```html
 * <tha-route path="/blog/:year/:month/:slug">
 *   <template>
 *     <article>
 *       <header>
 *         <time>
 *           <tha-router-param name="year"></tha-router-param>-
 *           <tha-router-param name="month"></tha-router-param>
 *         </time>
 *         <h1><tha-router-param name="slug"></tha-router-param></h1>
 *       </header>
 *     </article>
 *   </template>
 * </tha-route>
 * ```
 *
 * For `/blog/2024/12/hello-world`, renders:
 * ```html
 * <time>2024-12</time>
 * <h1>hello-world</h1>
 * ```
 *
 * ### Nested Routes with Parameter Inheritance
 *
 * ```html
 * <tha-router>
 *   <tha-route path="/projects/:projectId">
 *     <template>
 *       <h1>Project <tha-router-param name="projectId"></tha-router-param></h1>
 *
 *       <!-- Nested outlet inherits projectId parameter -->
 *       <tha-router-outlet>
 *         <tha-route path="/tasks/:taskId">
 *           <template>
 *             <!-- Both params are available -->
 *             <h2>Task Details</h2>
 *             <p>Project: <tha-router-param name="projectId"></tha-router-param></p>
 *             <p>Task: <tha-router-param name="taskId"></tha-router-param></p>
 *           </template>
 *         </tha-route>
 *       </tha-router-outlet>
 *     </template>
 *   </tha-route>
 *   <tha-router-outlet></tha-router-outlet>
 * </tha-router>
 * ```
 *
 * ### With Styling
 *
 * ```html
 * <style>
 *   tha-router-param {
 *     font-weight: bold;
 *     color: var(--primary-color);
 *   }
 *
 *   tha-router-param[name="id"] {
 *     font-family: monospace;
 *   }
 * </style>
 *
 * <tha-route path="/users/:id">
 *   <template>
 *     <span>User: <tha-router-param name="id"></tha-router-param></span>
 *   </template>
 * </tha-route>
 * ```
 *
 * ## How It Works
 *
 * 1. On connection, finds the nearest parent `<tha-router-outlet>`
 * 2. Accesses the outlet's PARAMS signal containing all route parameters
 * 3. Computes and displays the value for the specified parameter name
 * 4. Automatically re-renders when the route (and thus params) change
 *
 * ## Error Handling
 *
 * Throws an error if not placed within a `<tha-router-outlet>`:
 *
 * ```javascript
 * // ✗ Wrong - not inside outlet
 * <tha-router-param name="id"></tha-router-param>
 *
 * // ✓ Correct - inside outlet
 * <tha-router-outlet>
 *   <tha-router-param name="id"></tha-router-param>
 * </tha-router-outlet>
 * ```
 *
 * ## Alternative: Using Attributes
 *
 * The parent `<tha-router-outlet>` also exposes parameters as `param-*` attributes,
 * which can be used as an alternative approach:
 *
 * ```html
 * <tha-router-outlet id="outlet">
 *   <script>
 *     const outlet = document.getElementById('outlet');
 *     // Params available as: outlet.getAttribute('param-id')
 *   </script>
 * </tha-router-outlet>
 * ```
 *
 * However, `<tha-router-param>` is preferred for declarative templates.
 *
 * @example Basic usage
 * ```html
 * <tha-router>
 *   <tha-route path="/product/:sku">
 *     <template>
 *       <h1>Product: <tha-router-param name="sku"></tha-router-param></h1>
 *     </template>
 *   </tha-route>
 *   <tha-router-outlet></tha-router-outlet>
 * </tha-router>
 * ```
 *
 * @example Multiple params with formatting
 * ```html
 * <tha-route path="/user/:username/post/:postId">
 *   <template>
 *     <article>
 *       <p>@<tha-router-param name="username"></tha-router-param></p>
 *       <p>Post #<tha-router-param name="postId"></tha-router-param></p>
 *     </article>
 *   </template>
 * </tha-route>
 * ```
 */
@customElement('tha-router-param')
export class ThaRouterParam extends SignalWatcherLitElement {
  /**
   * Signal holding reference to the parent outlet.
   * Set during connectedCallback.
   */
  #outlet = signal<ThaRouterOutlet>(null!);

  /**
   * Signal tracking the parameter name to display.
   * Updated when the 'name' attribute changes.
   */
  #name = signal<string>('');

  /**
   * Computed signal that extracts the parameter value.
   * Reactively updates when the outlet's params or name changes.
   */
  #value = computed(() => this.#outlet.get()?.[PARAMS]?.get()[this.#name.get()]);

  /**
   * The name of the route parameter to display.
   *
   * Must match a parameter name defined in the route's path pattern.
   * For example, for path `/users/:id`, use `name="id"`.
   *
   * @attr name
   * @type {string}
   */
  @property({ type: String })
  name: string = '';

  /**
   * Lifecycle callback when element is connected to the DOM.
   *
   * Finds the parent `<tha-router-outlet>` and stores a reference.
   * Throws an error if not used within an outlet.
   *
   * @throws {Error} If no parent tha-router-outlet is found
   */
  override connectedCallback(): void {
    super.connectedCallback();

    const outlet = this.closest('tha-router-outlet');

    if (!outlet) {
      throw new Error('<tha-router-param> must be used within a <tha-router-outlet>.');
    }

    this.#outlet.set(outlet);
  }

  /**
   * Lifecycle callback when observed attributes change.
   *
   * Updates the internal name signal when the 'name' attribute changes,
   * which triggers the computed value signal to recalculate and re-render.
   *
   * @param name - The attribute name that changed
   * @param _old - Previous attribute value (unused)
   * @param value - New attribute value
   */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'name':
        this.#name.set(value ?? '');
        break;
    }
  }

  /**
   * Renders the parameter value.
   *
   * The value is extracted from the outlet's params signal and
   * displayed as text content. Automatically updates when the
   * route changes.
   *
   * @returns The parameter value as a template result
   */
  protected override render() {
    return html`${this.#value}`;
  }
}
