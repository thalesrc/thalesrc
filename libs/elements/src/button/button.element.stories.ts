import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "./button.element";
import type { ButtonType, ButtonVariant } from "./button.element";

/**
 * `<tp-button>` is a framework-agnostic, form-associated button. It mirrors the
 * native `<button>` element &mdash; tab-selectable, activates on `Space` /
 * `Enter`, and submits or resets its containing form via `type="submit"` /
 * `type="reset"`. Color comes from the shared shade-mixer palette (`color` +
 * `shade` 0&ndash;1000).
 */
interface Args {
  variant: ButtonVariant;
  color: string;
  shade: number;
  label: string;
  type: ButtonType;
  disabled: boolean;
}

const VARIANTS: ButtonVariant[] = ["solid", "outline", "text", "ghost"];
const TYPES: ButtonType[] = ["button", "submit", "reset"];
const COLORS: string[] = [
  "contrast",
  "primary",
  "secondary",
  "tertiary",
  "quaternary",
  "success",
  "danger",
  "warning",
  "neutral",
];

const meta: Meta<Args> = {
  title: "Elements/Button",
  component: "tp-button",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: VARIANTS,
    },
    color: {
      control: { type: "select" },
      options: COLORS,
    },
    shade: {
      control: { type: "range", min: 0, max: 1000, step: 50 },
    },
    label: {
      control: { type: "text" },
    },
    type: {
      control: { type: "inline-radio" },
      options: TYPES,
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
  args: {
    variant: "solid",
    color: "primary",
    shade: 500,
    label: "Click me",
    type: "button",
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<Args>;

const demoStyles = html`
  <style>
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(${VARIANTS.length}, minmax(8rem, 1fr));
      gap: 1rem;
      padding: 1rem;
      font-family: system-ui, sans-serif;
    }
    .demo-grid h4 {
      margin: 0;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: capitalize;
    }
    .demo-row {
      display: contents;
    }
    .row-label {
      font-family: system-ui, sans-serif;
      font-size: 0.85rem;
      align-self: center;
      text-transform: capitalize;
    }
  </style>
`;

/**
 * Interactive playground. Tweak variant, color, and shade to preview the
 * resulting button.
 */
export const Playground: Story = {
  render: (args) => html`
    ${demoStyles}
    <tp-button
      variant=${args.variant}
      color=${args.color}
      shade=${args.shade}
      type=${args.type}
      ?disabled=${args.disabled}
    >
      ${args.label}
    </tp-button>
  `,
};

/**
 * Every variant rendered side by side for the default color.
 */
export const Variants: Story = {
  render: (args) => html`
    ${demoStyles}
    <div class="demo-grid">
      ${VARIANTS.map(
        (variant) => html`
          <tp-button
            variant=${variant}
            color=${args.color}
            shade=${args.shade}
            ?disabled=${args.disabled}
          >
            ${variant}
          </tp-button>
        `,
      )}
    </div>
  `,
};

/**
 * Matrix of every color across every variant.
 */
export const ColorMatrix: Story = {
  render: (args) => html`
    ${demoStyles}
    <div
      class="demo-grid"
      style="grid-template-columns: 8rem repeat(${VARIANTS.length}, minmax(8rem, 1fr)); align-items: center; justify-items: center;"
    >
      <span></span>
      ${VARIANTS.map((variant) => html`<h4>${variant}</h4>`)}
      ${COLORS.map(
        (color) => html`
          <div class="demo-row">
            <span class="row-label">${color}</span>
            ${VARIANTS.map(
              (variant) => html`
                <tp-button
                  variant=${variant}
                  color=${color}
                  shade=${args.shade}
                  ?disabled=${args.disabled}
                >
                  ${color}
                </tp-button>
              `,
            )}
          </div>
        `,
      )}
    </div>
  `,
};

/**
 * Disabled buttons are not focusable and do not respond to clicks or keyboard
 * activation. The matrix shows every variant in both states.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => html`
    ${demoStyles}
    <div class="demo-grid" style="grid-template-columns: 8rem repeat(${VARIANTS.length}, minmax(8rem, 1fr));">
      <span></span>
      ${VARIANTS.map((variant) => html`<h4>${variant}</h4>`)}
      <div class="demo-row">
        <span class="row-label">enabled</span>
        ${VARIANTS.map(
          (variant) => html`
            <tp-button variant=${variant} color=${args.color} shade=${args.shade}>
              enabled
            </tp-button>
          `,
        )}
      </div>
      <div class="demo-row">
        <span class="row-label">disabled</span>
        ${VARIANTS.map(
          (variant) => html`
            <tp-button variant=${variant} color=${args.color} shade=${args.shade} disabled>
              disabled
            </tp-button>
          `,
        )}
      </div>
    </div>
  `,
};

/**
 * Demonstrates form participation: a `type="submit"` button submits its
 * containing form, while `type="reset"` clears the inputs. Use Tab to focus
 * the buttons and Enter / Space to activate them — they behave like a
 * native `<button>`.
 */
export const FormSubmission: Story = {
  args: { type: "submit" },
  render: (args) => {
    const onSubmit = (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const data = new FormData(form);
      const output = form.querySelector("output");
      if (output) {
        output.textContent = JSON.stringify(Object.fromEntries(data.entries()), null, 2);
      }
    };
    return html`
      ${demoStyles}
      <style>
        .demo-form {
          display: grid;
          gap: 0.75rem;
          font-family: system-ui, sans-serif;
          max-width: 22rem;
        }
        .demo-form label {
          display: grid;
          gap: 0.25rem;
          font-size: 0.85rem;
        }
        .demo-form input {
          padding: 0.4rem 0.5rem;
          border: 1px solid #d4d4d8;
          border-radius: 6px;
        }
        .demo-form .actions {
          display: flex;
          gap: 0.5rem;
        }
        .demo-form output {
          font-family: ui-monospace, monospace;
          font-size: 0.8rem;
          white-space: pre-wrap;
        }
      </style>
      <form class="demo-form" @submit=${onSubmit}>
        <label>
          Name
          <input name="name" value="Ada" />
        </label>
        <label>
          Email
          <input name="email" type="email" value="ada@example.com" />
        </label>
        <div class="actions">
          <tp-button
            variant=${args.variant}
            color=${args.color}
            shade=${args.shade}
            type=${args.type}
            ?disabled=${args.disabled}
          >
            Submit
          </tp-button>
          <tp-button variant="outline" color=${args.color} shade=${args.shade} type="reset">
            Reset
          </tp-button>
        </div>
        <output></output>
      </form>
    `;
  },
};

/**
 * Buttons participate in tab order out of the box (`tabindex="0"`). Press
 * Tab to move focus between them, then Space or Enter to activate. Disabled
 * buttons are skipped.
 */
export const KeyboardNavigation: Story = {
  render: (args) => html`
    ${demoStyles}
    <div style="display: flex; gap: 0.5rem; padding: 1rem; font-family: system-ui, sans-serif;">
      <tp-button variant=${args.variant} color=${args.color} shade=${args.shade}>First</tp-button>
      <tp-button variant=${args.variant} color=${args.color} shade=${args.shade}>Second</tp-button>
      <tp-button variant=${args.variant} color=${args.color} shade=${args.shade} disabled>Skipped</tp-button>
      <tp-button variant=${args.variant} color=${args.color} shade=${args.shade}>Third</tp-button>
    </div>
  `,
};
