/**
 * Global stylesheet for `<tp-select-old>`. Injected once at the document level
 * by the element's `static {}` block (same pattern as `tp-popover` and
 * `tp-details-set`). Light-DOM rendering means consumers can override
 * everything with plain CSS specificity.
 */

export const SELECT_GLOBAL_CSS = `
  tp-select-old {
    display: inline-flex;
    height: fit-content;
  }

  /* Raw <datalist>s are kept in the light DOM for semantics + form datalist
     compatibility but never rendered. */
  tp-select-old > datalist {
    display: none !important;
  }

  /* Default trigger: a borderless reset shell consumers can theme via
     CSS custom properties. */
  tp-select-old > button[part="trigger"] {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    inline-size: 100%;
    min-block-size: var(--tp-select-trigger-min-block-size, 2rem);
    padding: var(--tp-select-trigger-padding, 0.25rem 0.5rem);
    background: var(--tp-select-trigger-background, #fff);
    color: var(--tp-select-trigger-color, inherit);
    border: var(--tp-select-trigger-border, 1px solid #d4d4d8);
    border-radius: var(--tp-select-trigger-radius, 6px);
    font: inherit;
    cursor: pointer;
    text-align: start;
  }

  tp-select-old[disabled] > button[part="trigger"] {
    cursor: not-allowed;
    opacity: 0.6;
  }

  tp-select-old > button[part="trigger"] > [part="trigger-label"] {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tp-select-old > button[part="trigger"] > [part="trigger-label"][data-placeholder] {
    color: var(--tp-select-placeholder-color, #71717a);
  }

  tp-select-old > button[part="trigger"] > [part="trigger-arrow"]::before {
    content: "▾";
    font-size: 0.75em;
    line-height: 1;
    opacity: 0.7;
  }

  /* Listbox panel inside the popover. */
  tp-select-old > tp-popover[part="panel"] {
    margin: 0;
    padding: 0;
    border: var(--tp-select-panel-border, 1px solid #d4d4d8);
    border-radius: var(--tp-select-panel-radius, 6px);
    background: var(--tp-select-panel-background, #fff);
    box-shadow: var(--tp-select-panel-shadow, 0 8px 24px rgba(0, 0, 0, 0.12));
    min-inline-size: var(--tp-select-panel-min-inline-size, anchor-size(width));
    max-block-size: var(--tp-select-panel-max-block-size, 16rem);
    overflow: auto;
  }

  tp-select-old [part="listbox"] {
    display: block;
    padding: 0.25rem 0;
    margin: 0;
    list-style: none;
  }

  tp-select-old [part="group"] {
    display: block;
    padding: 0;
  }

  tp-select-old [part="group-label"] {
    display: block;
    padding: 0.25rem 0.75rem;
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--tp-select-group-label-color, #71717a);
    user-select: none;
  }

  tp-select-old [part="option"] {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    cursor: pointer;
    user-select: none;
  }

  tp-select-old [part="option"][aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  tp-select-old [part="option"][data-active="true"] {
    background: var(--tp-select-option-active-background, #e4e4e7);
  }

  tp-select-old [part="option"][aria-selected="true"] {
    background: var(--tp-select-option-selected-background, #dbeafe);
    font-weight: 600;
  }
`;
