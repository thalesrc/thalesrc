/**
 * @fileoverview History management mixin for Lit elements
 *
 * Hierarchical resolution: own history → parent history → global history
 *
 * @module router/history-managed
 */

import { property } from "lit/decorators.js";
import { getHistoryByType, GLOBAL_HISTORY, GLOBAL_HISTORY_TYPE, HistoryType } from "./history";
import { computed, Signal, signal } from "@lit-labs/signals";
import { History } from "history";
import { LitElement } from "lit";

/**
 * Constructor type for mixin pattern.
 * @template T - The instance type
 */
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Symbol for accessing the resolved history instance.
 *
 * @example
 * ```typescript
 * const history = this[HISTORY].get();
 * history.push('/path');
 * ```
 */
export const HISTORY = Symbol('HistoryManaged:history');

/**
 * Symbol for accessing the resolved history type.
 * @internal
 */
export const HISTORY_TYPE = Symbol('HistoryManaged:historyType');

/**
 * Interface for elements with history management.
 *
 * Resolution order: own history → parent history → global history
 */
export interface HistoryManagedLitElementType {
  /**
   * History strategy: "browser" | "hash" | "memory" | "memory:name"
   * If undefined, inherits from parent or uses global default.
   */
  history: HistoryType | undefined;

  /**
   * Computed signal with resolved history type.
   * @internal
   */
  [HISTORY_TYPE]: Signal.Computed<HistoryType | undefined>;

  /**
   * Computed signal with resolved history instance.
   * Access via: `this[HISTORY].get()`
   * @internal
   */
  [HISTORY]: Signal.Computed<History>;
}

/**
 * Mixin that adds hierarchical history management to Lit elements.
 *
 * Provides reactive history resolution: own → parent → global
 *
 * @example
 * ```typescript
 * class MyRouter extends HistoryManaged(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     const history = this[HISTORY].get();
 *     history.listen(({ location }) => this.updateRoutes());
 *   }
 * }
 * ```
 *
 * @template T - Base class (must extend LitElement)
 * @param superClass - The class to extend
 * @returns Extended class with history management
 */
export const HistoryManaged = <T extends Constructor<LitElement>>(superClass: T) => {
  class HistoryManagedLitElement extends superClass implements HistoryManagedLitElementType {
    /**
     * History strategy: "browser" | "hash" | "memory" | "memory:name"
     * If undefined, inherits from parent or uses global default.
     *
     * @attr history
     */
    @property({ type: String })
    history: HistoryType | undefined = undefined;

    /** Signal for own history type */
    #ownHistoryType = signal<HistoryType | undefined>(this.history);

    /** Computed signal for parent history type */
    #parentHistoryType = computed(() => {
      const parent = this.closest('tha-router-config, tha-router-outlet') as HistoryManagedLitElementType | null;

      return parent?.[HISTORY_TYPE]?.get();
    });

    /** Resolved history type: own → parent → global */
    [HISTORY_TYPE] = computed(() => this.#ownHistoryType.get() ?? this.#parentHistoryType.get() ?? GLOBAL_HISTORY_TYPE.get());

    /** Resolved history instance: own → parent → global */
    [HISTORY] = computed(() => getHistoryByType(this[HISTORY_TYPE].get()!));

    /**
     * Handles attribute changes, updating history signals when needed.
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
