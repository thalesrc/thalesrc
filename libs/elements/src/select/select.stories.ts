import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "./select.element";
import "./option.element";
import "./selected-content.element";
import type { SelectElement } from "./select.element";
import type { OptionElement } from "./option.element";

const meta: Meta = {
  title: "Elements/Select",
  component: "tp-select",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

/** Shared style block for the demos so stories stay readable. */
const demoStyles = html`
  <style>
    tp-select {
      font-family: system-ui, sans-serif;
      min-width: 12rem;
    }
    tp-select::part(button) {
      padding: 0.4rem 0.75rem;
      border: 1px solid #d4d4d8;
      border-radius: 6px;
      background: #fafafa;
      min-width: 12rem;
    }
    tp-select::part(popover) {
      border: 1px solid #d4d4d8;
      border-radius: 6px;
      background: white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      min-width: 12rem;
      margin-top: 4px;
    }
    tp-option {
      padding: 0.4rem 0.75rem;
    }
    tp-option:hover {
      background: #f4f4f5;
    }
    .demo-form {
      display: grid;
      gap: 0.75rem;
      font-family: system-ui, sans-serif;
    }
    .demo-form output {
      display: block;
      font-family: ui-monospace, monospace;
      font-size: 0.85rem;
      padding: 0.5rem;
      background: #f4f4f5;
      border-radius: 4px;
      white-space: pre;
      min-height: 1.5rem;
    }
    .demo-form button {
      justify-self: start;
      padding: 0.4rem 0.75rem;
      border: 1px solid #d4d4d8;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
    }
  </style>
`;

const fruitOptions = html`
  <tp-option value="apple">Apple</tp-option>
  <tp-option value="banana">Banana</tp-option>
  <tp-option value="cherry">Cherry</tp-option>
  <tp-option value="date">Date</tp-option>
  <tp-option value="elderberry">Elderberry</tp-option>
`;

/** Default single-select. `max` defaults to `1`; the placeholder shows until a value is chosen. */
export const SingleSelect: Story = {
  render: () => html`
    ${demoStyles}
    <tp-select placeholder="Pick a fruit">${fruitOptions}</tp-select>
  `,
};

/** Single-select with a pre-set `value` attribute. */
export const InitialValue: Story = {
  render: () => html`
    ${demoStyles}
    <tp-select value="cherry">${fruitOptions}</tp-select>
  `,
};

/** Multi-select with `max="3"`. Selecting a 4th option evicts the oldest one (FIFO). */
export const MultiSelectMax: Story = {
  render: () => html`
    ${demoStyles}
    <tp-select max="3" placeholder="Pick up to 3">${fruitOptions}</tp-select>
  `,
};

/** Unbounded multi-select with `max="infinite"`. */
export const MultiSelectInfinite: Story = {
  render: () => html`
    ${demoStyles}
    <tp-select max="infinite" placeholder="Pick any">${fruitOptions}</tp-select>
  `,
};

/** `disabled` makes the control non-interactive and excludes it from form submission. */
export const Disabled: Story = {
  render: () => html`
    ${demoStyles}
    <tp-select disabled value="banana">${fruitOptions}</tp-select>
  `,
};

/** Custom trigger button via `slot="button"`. Embed `<tp-selected-content>` to mirror the selection. */
export const CustomButton: Story = {
  render: () => html`
    ${demoStyles}
    <style>
      .custom-trigger {
        padding: 0.5rem 1rem;
        background: #0078d4;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
      }
    </style>
    <tp-select max="infinite">
      <div slot="button" class="custom-trigger">
        <span>🍇</span>
        <tp-selected-content></tp-selected-content>
      </div>
      ${fruitOptions}
    </tp-select>
  `,
};

/**
 * `slot="popover"` lets the consumer **hide** the default rendering of
 * `<tp-option>` children and show arbitrary content inside the panel instead.
 *
 * The options remain children of `<tp-select>`, so they still register with
 * the select context and participate in selection/validation/form submission —
 * they just aren't displayed. Pair it with the programmatic API
 * (`selectOption` / `value`) or with custom UI inside the slot to drive
 * selection without the default option list.
 *
 * In this demo, the four `<tp-option>`s are kept in context but the panel
 * shows a custom message and a button that selects programmatically.
 */
export const CustomPopoverContent: Story = {
  render: () => html`
    ${demoStyles}
    <style>
      .panel-header {
        padding: 0.4rem 0.75rem;
        font-weight: 600;
        border-bottom: 1px solid #e4e4e7;
      }
      .panel-body {
        padding: 0.75rem;
        display: grid;
        gap: 0.5rem;
        font-family: system-ui, sans-serif;
        font-size: 0.9rem;
      }
      .panel-body button {
        padding: 0.3rem 0.6rem;
        border: 1px solid #d4d4d8;
        border-radius: 4px;
        background: #fafafa;
        cursor: pointer;
      }
    </style>
    <tp-select max="infinite" placeholder="Featured fruits">
      <tp-option value="apple">🍎 Apple</tp-option>
      <tp-option value="banana">🍌 Banana</tp-option>
      <tp-option value="cherry">🍒 Cherry</tp-option>
      <tp-option value="grape">🍇 Grape</tp-option>
      <div slot="popover">
        <div class="panel-header">Featured</div>
        <div class="panel-body">
          <span>Options are in context but hidden — pick via the button.</span>
          <button @click=${(e: Event) => {
            const select = (e.currentTarget as HTMLElement).closest("tp-select") as SelectElement;
            select.value = "apple,cherry";
          }}>Pick apple + cherry</button>
        </div>
      </div>
    </tp-select>
  `,
};

/** A standalone `<tp-selected-content>` placed outside the trigger acts as a live label. */
export const StandaloneSelectedContent: Story = {
  render: () => html`
    ${demoStyles}
    <div style="display: grid; gap: 0.5rem; font-family: system-ui, sans-serif;">
      <tp-select max="infinite" placeholder="Pick fruits">${fruitOptions}</tp-select>
      <div>
        Current selection:
        <strong>
          <tp-selected-content></tp-selected-content>
        </strong>
      </div>
    </div>
  `,
};

/** `required` triggers `valueMissing`; the form below shows the submitted FormData. */
export const RequiredInForm: Story = {
  render: () => {
    const onSubmit = (e: Event) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      const data = new FormData(form);
      const out = form.querySelector("output")!;
      const entries: Record<string, string[]> = {};
      data.forEach((value, key) => {
        const list = (entries[key] ??= []);
        list.push(typeof value === "string" ? value : value.name);
      });
      out.textContent = JSON.stringify(entries, null, 2);
    };
    return html`
      ${demoStyles}
      <form class="demo-form" @submit=${onSubmit}>
        <label>
          Fruit (required, single):
          <tp-select name="fruit" required placeholder="Required">${fruitOptions}</tp-select>
        </label>
        <label>
          Tags (multi):
          <tp-select name="tags" max="infinite" placeholder="Any number">${fruitOptions}</tp-select>
        </label>
        <div style="display: flex; gap: 0.5rem;">
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
        <output>(submit to see FormData)</output>
      </form>
    `;
  },
};

/** Programmatic API: `selectOption` / `deselectOption` / `toggleOption` plus the `value` setter. */
export const ProgrammaticApi: Story = {
  render: () => {
    const getSelect = (e: Event): SelectElement =>
      (e.currentTarget as HTMLElement)
        .closest(".demo-form")!
        .querySelector("tp-select") as SelectElement;
    return html`
      ${demoStyles}
      <div class="demo-form">
        <tp-select max="infinite" placeholder="Use the buttons">${fruitOptions}</tp-select>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button @click=${(e: Event) => {
            const s = getSelect(e);
            const opt = s.querySelector('tp-option[value="apple"]') as OptionElement;
            s.toggleOption(opt);
          }}>Toggle apple</button>
          <button @click=${(e: Event) => {
            getSelect(e).value = "banana,cherry";
          }}>Set value=banana,cherry</button>
          <button @click=${(e: Event) => {
            getSelect(e).value = "";
          }}>Clear</button>
        </div>
      </div>
    `;
  },
};
