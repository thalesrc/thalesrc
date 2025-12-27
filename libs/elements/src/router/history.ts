import { computed, signal } from "@lit-labs/signals";
import { createBrowserHistory, createHashHistory, createMemoryHistory, History } from "history";

/**
 * Supported history types for the router.
 *
 * - `"browser"` - Uses the HTML5 History API (pushState, replaceState)
 * - `"hash"` - Uses hash-based routing (#/path)
 * - `"memory"` - In-memory history for testing or non-browser environments
 * - `"memory:${string}"` - Named memory history instances for isolation
 */
export type HistoryType = "browser" | "hash" | "memory" | `memory:${string}`;

/**
 * Global registry mapping history types to their singleton instances.
 * Ensures that the same history object is reused across all routers of the same type.
 */
const HISTORY_MAP = {} as Record<HistoryType, History>;

/**
 * Default history type used when no explicit type is specified.
 * Uses browser history (HTML5 History API).
 */
export const DEFAULT_HISTORY_TYPE: HistoryType = "browser";

/**
 * Reactive signal containing the currently active global history type.
 * Changing this signal will cause all routers using the global history to switch types.
 */
export const GLOBAL_HISTORY_TYPE = signal<HistoryType>(DEFAULT_HISTORY_TYPE);

/**
 * Computed signal that returns the History instance for the current global history type.
 * Automatically updates when GLOBAL_HISTORY_TYPE changes.
 */
export const GLOBAL_HISTORY = computed(() => getHistoryByType(GLOBAL_HISTORY_TYPE.get()));

/**
 * Retrieves or creates a History instance for the specified type.
 *
 * History instances are cached in HISTORY_MAP as singletons, so multiple
 * calls with the same type will return the same instance. This ensures
 * that navigation state is shared across all routers using the same history type.
 *
 * @param type - The type of history to retrieve ("browser", "hash", "memory", or "memory:name")
 * @returns The History instance for the specified type
 *
 * @example
 * ```typescript
 * // Get browser history
 * const browserHistory = getHistoryByType('browser');
 *
 * // Get hash-based history
 * const hashHistory = getHistoryByType('hash');
 *
 * // Get isolated memory history for testing
 * const testHistory = getHistoryByType('memory:test-suite-1');
 * ```
 */
export function getHistoryByType(type: HistoryType): History {
  let history = HISTORY_MAP[type];

  if (!history) {
    switch (type) {
      case 'browser':
        history = createBrowserHistory();
        break;
      case 'hash':
        history = createHashHistory();
        break;
      default:
        history = createMemoryHistory();
    }

    HISTORY_MAP[type as HistoryType] = history;
  }

  return history;
}
