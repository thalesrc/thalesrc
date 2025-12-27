import { computed, signal } from "@lit-labs/signals";
import { createBrowserHistory, createHashHistory, createMemoryHistory, History } from "history";

export type HistoryType = "browser" | "hash" | "memory" | `memory:${string}`;

export const HISTORY_MAP = {} as Record<HistoryType, History>;

export const DEFAULT_HISTORY_TYPE: HistoryType = "browser";

export const GLOBAL_HISTORY_TYPE = signal<HistoryType>(DEFAULT_HISTORY_TYPE);

export const GLOBAL_HISTORY = computed(() => getHistoryByType(GLOBAL_HISTORY_TYPE.get()));

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
