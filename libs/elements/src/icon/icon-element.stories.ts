import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "./icon-element";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IconArgs = {
  variant: "outlined" | "round" | "sharp";
  filled: boolean;
  grade: number;
  weight: number;
  opticalSize: number;
  glyph: string;
};

const meta: Meta<IconArgs> = {
  title: "Elements/Icon",
  component: "tp-icon",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["outlined", "round", "sharp"],
    },
    filled: { control: "boolean" },
    grade: { control: { type: "range", min: -25, max: 200, step: 25 } },
    weight: { control: { type: "range", min: 100, max: 700, step: 100 } },
    opticalSize: { control: { type: "range", min: 20, max: 48, step: 4 } },
    glyph: { control: "text" },
  },
  args: {
    variant: "outlined",
    filled: false,
    grade: 0,
    weight: 400,
    opticalSize: 24,
    glyph: "home",
  },
  render: (args) => html`
    <tp-icon
      variant=${args["variant"]}
      ?filled=${args["filled"]}
      grade=${args["grade"]}
      weight=${args["weight"]}
      optical-size=${args["opticalSize"]}
      style="font-size: 64px"
    >${args["glyph"]}</tp-icon>
  `,
};

export default meta;

type Story = StoryObj<IconArgs>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; font-size: 64px; align-items: center;">
      <tp-icon variant="outlined">home</tp-icon>
      <tp-icon variant="round">home</tp-icon>
      <tp-icon variant="sharp">home</tp-icon>
    </div>
  `,
};

export const Filled: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; font-size: 64px; align-items: center;">
      <tp-icon>favorite</tp-icon>
      <tp-icon filled>favorite</tp-icon>
    </div>
  `,
};

export const AxisShowcase: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; font-size: 64px;">
      <tp-icon weight="100">settings</tp-icon>
      <tp-icon weight="400">settings</tp-icon>
      <tp-icon weight="700">settings</tp-icon>
      <tp-icon weight="700" filled>settings</tp-icon>
      <tp-icon grade="-25">star</tp-icon>
      <tp-icon grade="0">star</tp-icon>
      <tp-icon grade="200">star</tp-icon>
      <tp-icon grade="200" filled>star</tp-icon>
    </div>
  `,
};
