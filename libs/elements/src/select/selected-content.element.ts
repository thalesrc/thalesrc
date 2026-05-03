import { consume } from "@lit/context";
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { DomClone } from '@thalesrc/dom-utils';

import { SignalWatcherLitElement } from "../utils/signal-watcher-lit-element";
import type { SelectElement } from "./select.element";
import type { OptionElement } from "./option.element";
import { selectContext } from "./select-context";
import { SHOULD_REGISTER_TO_SELECT } from "./internal-props";

declare global {
  interface HTMLElementTagNameMap {
    "tp-selected-content": SelectedContentElement;
  }
}


/**
 * Renders the current `value` of the ancestor `<tp-select>`.
 *
 * Falls back to the default slot content (typically a placeholder) when the
 * parent has no value yet.
 *
 * Discovery uses `@lit/context`, so this element can live anywhere in the
 * descendant **composed** tree — including across nested shadow DOM
 * boundaries — and still find its provider. The provider's signal-backed
 * `value` is read inside `render()` and the `SignalWatcher` mixin
 * automatically keeps us in sync.
 */
@customElement("tp-selected-content")
export class SelectedContentElement extends SignalWatcherLitElement {
  static styles = (() => {
    const style = css`
      tp-selected-content {
        display: inline-block;

        tp-option {
          display: inline-block;
        }
      }
    `;

    document.adoptedStyleSheets = [...document.adoptedStyleSheets, style.styleSheet!];

    return style;
  })();

  #cloneCache = new WeakMap<OptionElement, DomClone<OptionElement>>();

  @consume({ context: selectContext, subscribe: true })
  @state()
  private select?: SelectElement;

  protected override createRenderRoot() {
    return this;
  }

  protected override render(): unknown {
    const placeholder = this.select?.placeholder ?? "";
    const selectedOptions = this.select?.selectedOptions.get().map(ref => ref.deref()!).filter(Boolean) ?? [];
    const clones = this.#getOptionClones(selectedOptions);

    return !selectedOptions.length
      ? placeholder
      : clones.map(clone => html`${clone}`);
  }

  #getOptionClones(options: OptionElement[]): OptionElement[] {
    return options.map(option => {
      let mirror = this.#cloneCache.get(option);

      if (!mirror) {
        mirror = new DomClone(option);
        this.#cloneCache.set(option, mirror);
        mirror.clone.setAttribute("part", "selected-content-option");
        mirror.clone[SHOULD_REGISTER_TO_SELECT] = false;
      }

      return mirror.clone;
    });
  }
}
