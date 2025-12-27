import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DEFAULT_HISTORY_TYPE, GLOBAL_HISTORY_TYPE, HistoryType } from "./history";

@customElement('tha-router-config')
export class ThaRouterConfig extends LitElement {
  @property({ type: String })
  history: HistoryType = DEFAULT_HISTORY_TYPE;

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'history':
        GLOBAL_HISTORY_TYPE.set(value as HistoryType || DEFAULT_HISTORY_TYPE);
        break;
    }
  }
}
