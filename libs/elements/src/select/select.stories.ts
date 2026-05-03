import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "./select.element";

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

export const Default: Story = {
  render: () => html`
    <style>
      ::part(selected-content-option) {
        background: blue;
      }
    </style>
    <tp-select value="veli" max="2">
      Ali Veli 49 50
      <tp-option value="ali">
        <h1 class="text-rose-500">Ali</h1>
      </tp-option>
      <tp-option value="veli">Veli</tp-option>
      <tp-option value="49">49</tp-option>
      <tp-option value="50">50</tp-option>
    </tp-select>
  `,
};

export const CustomButton: Story = {
  render: () => html`
    <tp-select>
      <div slot="button" style="padding: 0.5rem 1rem; background: #0078d4; color: white; border-radius: 4px;">
        Custom Button
        <tp-selected-content></tp-selected-content>
      </div>
      Ali Veli 49 50
      <tp-option value="ali">
        <h1 class="font-bold">Ali</h1>
      </tp-option>
      <tp-option value="veli">Veli</tp-option>
      <tp-option value="49">49</tp-option>
      <tp-option value="50">50</tp-option>
    </tp-select>
  `,
};

export const CustomPopover: Story = {
  render: () => html`
    <tp-select>
      <button slot="button">Custom Button</button>
      <div slot="popover">
        <p>Custom Popover Content</p>
      </div>
    </tp-select>
  `,
};
