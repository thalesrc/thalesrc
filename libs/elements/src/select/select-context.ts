import { createContext } from "@lit/context";

import type { SelectElement } from "./select.element";

/**
 * Context key carrying the host `<tp-select>` element down through the
 * composed tree. Using `@lit/context` means consumers can be nested inside
 * any number of shadow DOM boundaries and still find their `<tp-select>`
 * via the bubbling, composed `context-request` event.
 */
export const selectContext = createContext<SelectElement>(
  Symbol("tp-select"),
);
