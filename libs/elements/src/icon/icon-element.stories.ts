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

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type SimpleIconArgs = {
  slug: string;
  color: string;
  size: number;
};

export const SimpleIcons: StoryObj<SimpleIconArgs> = {
  name: "Simple Icons / Single",
  argTypes: {
    slug: { control: "text" },
    color: { control: "color" },
    size: { control: { type: "range", min: 16, max: 128, step: 4 } },
  },
  args: {
    slug: "facebook",
    color: "#1877F2",
    size: 64,
  },
  render: (args) => html`
    <tp-icon
      family="simple-icons"
      slug=${args.slug}
      style=${`color: ${args.color}; font-size: ${args.size}px`}
    ></tp-icon>
  `,
};

export const SimpleIconsGallery: StoryObj = {
  name: "Simple Icons / Gallery",
  render: () => html`
    <div style="display: flex; gap: 24px; font-size: 64px; align-items: center;">
      <tp-icon family="simple-icons" slug="facebook" style="color: #1877F2"></tp-icon>
      <tp-icon family="simple-icons" slug="youtube" style="color: #FF0000"></tp-icon>
      <tp-icon family="simple-icons" slug="instagram" style="color: #0A66C2"></tp-icon>
      <tp-icon family="simple-icons" slug="github" style="color: #181717"></tp-icon>
      <tp-icon family="simple-icons" slug="x" style="color: #000000"></tp-icon>
    </div>
  `,
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type TheSvgArgs = {
  slug: string;
  variant: string;
  size: number;
};

export const TheSvg: StoryObj<TheSvgArgs> = {
  name: "theSVG / Single",
  argTypes: {
    slug: { control: "text" },
    variant: { control: "text" },
    size: { control: { type: "range", min: 16, max: 128, step: 4 } },
  },
  args: {
    slug: "google",
    variant: "default",
    size: 64,
  },
  render: (args) => html`
    <tp-icon
      family="thesvg"
      slug=${args.slug}
      variant=${args.variant}
      style=${`font-size: ${args.size}px`}
    ></tp-icon>
  `,
};

export const TheSvgVariants: StoryObj = {
  name: "theSVG / Variants",
  render: () => html`
    <div style="display: flex; gap: 24px; font-size: 64px; align-items: center;">
      <tp-icon family="thesvg" slug="google" variant="default"></tp-icon>
      <tp-icon family="thesvg" slug="google" variant="mono"></tp-icon>
      <tp-icon family="thesvg" slug="google" variant="wordmark"></tp-icon>
    </div>
  `,
};

export const TheSvgGallery: StoryObj = {
  name: "theSVG / Gallery",
  render: () => html`
    <div style="display: flex; gap: 24px; font-size: 64px; align-items: center;">
      <tp-icon family="thesvg" slug="google"></tp-icon>
      <tp-icon family="thesvg" slug="claude"></tp-icon>
      <tp-icon family="thesvg" slug="npm"></tp-icon>
      <tp-icon family="thesvg" slug="microsoft"></tp-icon>
      <tp-icon family="thesvg" slug="netflix"></tp-icon>
      <tp-icon family="thesvg" slug="spotify"></tp-icon>
    </div>
  `,
};
