import { consume } from "@lit/context";
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { DomClone } from '@telperion/dom-utils';

import { SignalWatcherLitElement } from "../utils/signal-watcher-lit-element";
import type { SelectElement } from "./select.element";
import type { OptionElement } from "./option.element";
import { selectContext } from "./select-context";
import { SHOULD_REGISTER_TO_SELECT } from "./internal-props";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * Mirrors the currently-selected `<tp-option>`(s) of an ancestor
     * `<tp-select>`, falling back to the host's `placeholder` text when
     * the selection is empty.
     *
     * Discovers its host via `@lit/context`, so it can live anywhere in
     * the descendant composed tree — including across nested shadow DOM
     * boundaries. Selected options are deeply cloned and projected into
     * this element's light DOM; clones are inert (they don't register
     * back to the select) and carry `part="selected-content-option"`.
     *
     * Used as the default content of the `<tp-select>` trigger button,
     * but can be placed anywhere a label-style mirror is useful.
     *
     * @example
     * ```html
     * <tp-select>
     *   <button slot="button">
     *     <tp-selected-content></tp-selected-content>
     *   </button>
     *   <tp-option value="apple">Apple</tp-option>
     * </tp-select>
     * ```
     */
    "tp-selected-content": SelectedContentElement;
  }
}


@customElement("tp-selected-content")
export class SelectedContentElement extends SignalWatcherLitElement {
  static styles = (() => {
    const style = css`
      tp-selected-content {
        display: inline-block;

        tp-option {
          display: inline-block;

          &:not(:last-of-type)::after {
            content: ",";
            white-space: pre;
            margin-right: 0.25em;
          }
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
      ? html`<span part="placeholder">${placeholder}</span>`
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
