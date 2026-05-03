import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "./select-element";

interface Args {
  multiple: boolean;
  disabled: boolean;
  required: boolean;
  placeholder: string;
  position: string;
}

const meta: Meta<Args> = {
  title: "Elements/Agent Select",
  component: "tp-select-old",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    placeholder: { control: "text" },
    position: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<Args>;

const stage = html`
  <style>
    .stage {
      display: grid;
      gap: 1rem;
      min-block-size: 60vh;
      padding: 4rem;
      font-family: system-ui, sans-serif;
    }
    tp-select-old {
      inline-size: 16rem;
    }
    form {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px dashed #d4d4d8;
      border-radius: 6px;
    }
    output {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 0.85em;
      padding: 0.5rem;
      background: #f4f4f5;
      border-radius: 4px;
      min-block-size: 1.25rem;
    }
  </style>
`;

const defaultArgs: Args = {
  multiple: false,
  disabled: false,
  required: false,
  placeholder: "Pick a fruit",
  position: "start to start / top to bottom",
};

/** Single-selection select with one datalist of options. */
export const Single: Story = {
  args: defaultArgs,
  render: (args) => html`
    ${stage}
    <div class="stage">
      <tp-select-old
        ?multiple=${args.multiple}
        ?disabled=${args.disabled}
        ?required=${args.required}
        placeholder=${args.placeholder}
        position=${args.position}
        @tp-select-change=${(e: CustomEvent) => {
          const out = document.querySelector("output[data-name='single']");
          if (out) out.textContent = JSON.stringify(e.detail.values);
        }}
      >
        <datalist>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
          <option value="date" disabled>Date (out of stock)</option>
          <option value="elderberry">Elderberry</option>
        </datalist>
      </tp-select-old>
      <output data-name="single">[]</output>
    </div>
  `,
};

/** Multi-selection — clicking an option toggles it and the panel stays open. */
export const Multiple: Story = {
  args: { ...defaultArgs, multiple: true, placeholder: "Pick cities" },
  render: (args) => html`
    ${stage}
    <div class="stage">
      <tp-select-old
        multiple
        ?disabled=${args.disabled}
        ?required=${args.required}
        placeholder=${args.placeholder}
        position=${args.position}
        @tp-select-change=${(e: CustomEvent) => {
          const out = document.querySelector("output[data-name='multi']");
          if (out) out.textContent = JSON.stringify(e.detail.values);
        }}
      >
        <datalist label="Europe">
          <option>Paris</option>
          <option>Berlin</option>
          <option>Madrid</option>
        </datalist>
        <datalist label="Asia">
          <option>Tokyo</option>
          <option>Seoul</option>
          <option disabled>Pyongyang</option>
        </datalist>
        <datalist label="Americas">
          <option>New York</option>
          <option>Mexico City</option>
        </datalist>
      </tp-select-old>
      <output data-name="multi">[]</output>
    </div>
  `,
};

/** Multiple datalists rendered as visually grouped sections in the panel. */
export const Grouped: Story = {
  args: defaultArgs,
  render: () => html`
    ${stage}
    <div class="stage">
      <tp-select-old placeholder="Pick anything">
        <datalist label="Fruits">
          <option>Apple</option>
          <option>Banana</option>
        </datalist>
        <datalist label="Vegetables">
          <option>Carrot</option>
          <option>Spinach</option>
        </datalist>
        <datalist>
          <option>Ungrouped option</option>
        </datalist>
      </tp-select-old>
    </div>
  `,
};

/**
 * Form-associated: the select participates in `<form>` submission via
 * `ElementInternals`. Multi mode submits one entry per selected value, just
 * like a native `<select multiple>`.
 */
export const InAForm: Story = {
  args: { ...defaultArgs, required: true },
  render: (args) => html`
    ${stage}
    <div class="stage">
      <form
        @submit=${(e: SubmitEvent) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const lines: string[] = [];
          for (const [k, v] of fd.entries()) lines.push(`${k} = ${String(v)}`);
          const out = document.querySelector("output[data-name='form']");
          if (out) out.textContent = lines.join("\n") || "(empty)";
        }}
      >
        <label>
          Fruit
          <tp-select-old
            name="fruit"
            ?required=${args.required}
            placeholder=${args.placeholder}
            position=${args.position}
          >
            <datalist>
              <option>apple</option>
              <option>banana</option>
              <option>cherry</option>
            </datalist>
          </tp-select-old>
        </label>
        <label>
          Toppings (multi)
          <tp-select-old name="topping" multiple placeholder="Pick toppings">
            <datalist>
              <option>chocolate</option>
              <option>caramel</option>
              <option>nuts</option>
            </datalist>
          </tp-select-old>
        </label>
        <button type="submit">Submit</button>
        <output data-name="form">(unsubmitted)</output>
      </form>
    </div>
  `,
};

/** Disabled state — the trigger is not interactive. */
export const Disabled: Story = {
  args: { ...defaultArgs, disabled: true },
  render: (args) => html`
    ${stage}
    <div class="stage">
      <tp-select-old disabled placeholder=${args.placeholder}>
        <datalist>
          <option>apple</option>
          <option>banana</option>
        </datalist>
      </tp-select-old>
    </div>
  `,
};

/**
 * Bring-your-own trigger: any direct child carrying the `tp-select-button`
 * attribute replaces the default button. ARIA state and `disabled` are
 * synced onto the consumer's element automatically.
 */
export const CustomButton: Story = {
  args: defaultArgs,
  render: (args) => html`
    ${stage}
    <div class="stage">
      <tp-select-old placeholder=${args.placeholder}>
        <button tp-select-button type="button" style="padding: 0.5rem 1rem; cursor: pointer;">
          Pick a fruit ▾
        </button>
        <datalist>
          <option>apple</option>
          <option>banana</option>
          <option>cherry</option>
        </datalist>
      </tp-select-old>
    </div>
  `,
};
