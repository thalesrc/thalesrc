import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "./popover-element";

type InlinePos = "start" | "center" | "end";
type BlockPos = "top" | "middle" | "bottom";
type Trigger = "manual" | "click" | "hover";

interface Args {
  popInline: InlinePos;
  targetInline: InlinePos;
  popBlock: BlockPos;
  targetBlock: BlockPos;
  trigger: Trigger;
}

const INLINE_OPTIONS: InlinePos[] = ["start", "center", "end"];
const BLOCK_OPTIONS: BlockPos[] = ["top", "middle", "bottom"];
const TRIGGER_OPTIONS: Trigger[] = ["manual", "click", "hover"];

const meta: Meta<Args> = {
  title: "Elements/Popover",
  component: "tp-popover",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    popInline: {
      name: "popover inline edge",
      control: { type: "inline-radio" },
      options: INLINE_OPTIONS,
      table: { category: "position" },
    },
    targetInline: {
      name: "target inline edge",
      control: { type: "inline-radio" },
      options: INLINE_OPTIONS,
      table: { category: "position" },
    },
    popBlock: {
      name: "popover block edge",
      control: { type: "inline-radio" },
      options: BLOCK_OPTIONS,
      table: { category: "position" },
    },
    targetBlock: {
      name: "target block edge",
      control: { type: "inline-radio" },
      options: BLOCK_OPTIONS,
      table: { category: "position" },
    },
    trigger: {
      control: { type: "inline-radio" },
      options: TRIGGER_OPTIONS,
    },
  },
};

export default meta;

type Story = StoryObj<Args>;

const popoverStyles = html`
  <style>
    .demo-anchor {
      padding: 0.5rem 1rem;
      border: 1px solid #71717a;
      border-radius: 6px;
      background: #fafafa;
      font-family: system-ui, sans-serif;
      cursor: pointer;
    }
    tp-popover {
      border: 1px solid #d4d4d8;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      background: white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      font-family: system-ui, sans-serif;
      max-width: 18rem;
    }
    tp-popover code {
      font-size: 0.85em;
    }
    .stage {
      display: grid;
      place-items: center;
      min-height: 60vh;
      padding: 4rem;
      gap: 1rem;
    }
    .shorthand-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(12rem, 1fr));
      gap: 5rem 4rem;
      padding: 5rem;
    }
    .shorthand-grid .cell {
      display: grid;
      place-items: center;
      min-height: 5rem;
    }
    tp-popover.demo {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      max-width: none;
    }
  </style>
`;

const buildPosition = (args: Args) =>
  `${args.popInline} to ${args.targetInline} / ${args.popBlock} to ${args.targetBlock}`;

const defaultArgs: Args = {
  popInline: "center",
  targetInline: "center",
  popBlock: "bottom",
  targetBlock: "top",
  trigger: "click",
};

/**
 * Interactive playground. Tweak the four position selectors to see how the
 * popover edge attaches to the target edge on each axis.
 */
export const Playground: Story = {
  args: defaultArgs,
  render: (args) => {
    const position = buildPosition(args);
    return html`
      ${popoverStyles}
      <div class="stage">
        <div>
          <button class="demo-anchor">Anchor (parent)</button>
          <tp-popover position=${position} trigger=${args.trigger}>
            <code>${position}</code>
          </tp-popover>
        </div>
      </div>
    `;
  },
};

/**
 * Anchor by selector instead of falling back to `parentElement`.
 */
export const TargetSelector: Story = {
  args: { ...defaultArgs, popInline: "start", targetInline: "start", popBlock: "top", targetBlock: "bottom" },
  render: (args) => {
    const position = buildPosition(args);
    return html`
      ${popoverStyles}
      <div class="stage">
        <button id="story-trigger" class="demo-anchor">Click me</button>
        <tp-popover target="#story-trigger" position=${position} trigger=${args.trigger}>
          Anchored via <code>target="#story-trigger"</code>.
        </tp-popover>
      </div>
    `;
  },
};

/**
 * Tooltip-style: opens on hover and on focus.
 */
export const HoverTrigger: Story = {
  args: { ...defaultArgs, trigger: "hover" },
  render: (args) => {
    const position = buildPosition(args);
    return html`
      ${popoverStyles}
      <div class="stage">
        <div>
          <button class="demo-anchor">Hover or focus me</button>
          <tp-popover position=${position} trigger=${args.trigger}>
            Tooltip-style popover. Stays open while hovered or focused.
          </tp-popover>
        </div>
      </div>
    `;
  },
};

/**
 * Default `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline`
 * automatically flips the popover when there isn't enough room on the chosen
 * side. Disable per-instance with `position-try-fallbacks: none`.
 */
export const AutomaticFlip: Story = {
  args: defaultArgs,
  render: (args) => {
    const position = buildPosition(args);
    return html`
      ${popoverStyles}
      <div class="stage" style="align-items: start; justify-items: start;">
        <div>
          <button class="demo-anchor">Near top edge</button>
          <tp-popover position=${position} trigger=${args.trigger}>
            Flips automatically when clipped.
          </tp-popover>
        </div>
      </div>
    `;
  },
};

// ---------------------------------------------------------------------------
// Shorthand showcases
// ---------------------------------------------------------------------------

const SHORTHAND_TWO = [
  { label: "center / top", expands: "center to center / bottom to top" },
  { label: "center / bottom", expands: "center to center / top to bottom" },
  { label: "start / middle", expands: "end to start / middle to middle" },
  { label: "end / middle", expands: "start to end / middle to middle" },
  { label: "end / bottom", expands: "start to end / top to bottom" },
  { label: "start / top", expands: "end to start / bottom to top" },
];

const SHORTHAND_SINGLE = [
  { label: "top", expands: "center to center / bottom to top" },
  { label: "bottom", expands: "center to center / top to bottom" },
  { label: "start", expands: "end to start / middle to middle" },
  { label: "end", expands: "start to end / middle to middle" },
  { label: "center", expands: "center to center / middle to middle" },
  { label: "middle", expands: "center to center / middle to middle" },
];

const SHORTHAND_SINGLE_AXIS = [
  { label: "top to bottom", expands: "center to center / top to bottom" },
  { label: "bottom to top", expands: "center to center / bottom to top" },
  { label: "start to center", expands: "start to center / middle to middle" },
  { label: "end to start", expands: "end to start / middle to middle" },
];

interface ShorthandArgs {
  trigger: Trigger;
}

const shorthandMeta = (samples: Array<{ label: string; expands: string }>) =>
  ({
    args: { trigger: "click" } as ShorthandArgs,
    argTypes: {
      trigger: { control: { type: "inline-radio" }, options: TRIGGER_OPTIONS },
    },
    render: ({ trigger }: ShorthandArgs) => html`
      ${popoverStyles}
      <div class="shorthand-grid">
        ${samples.map(
          (s, i) => html`
            <div class="cell">
              <button class="demo-anchor" id="sh-${i}">
                <code>${s.label}</code>
              </button>
              <tp-popover
                class="demo"
                target="#sh-${i}"
                position=${s.label}
                mode="manual"
                trigger=${trigger}
              >
                <code>${s.expands}</code>
              </tp-popover>
            </div>
          `,
        )}
      </div>
    `,
  }) satisfies StoryObj<ShorthandArgs>;

/**
 * `<inline> / <block>` — each half a single keyword. Each keyword expands to
 * the natural "outside" mapping for its axis.
 */
export const TwoKeywordShorthand: StoryObj<ShorthandArgs> = shorthandMeta(SHORTHAND_TWO);

/**
 * Single keyword — sets one axis and centers/middles the other.
 */
export const SingleKeywordShorthand: StoryObj<ShorthandArgs> = shorthandMeta(SHORTHAND_SINGLE);

/**
 * Single axis (no `/`) — `<a> to <b>` for one axis only; the other defaults
 * to its centered/middle form.
 */
export const SingleAxisShorthand: StoryObj<ShorthandArgs> = shorthandMeta(SHORTHAND_SINGLE_AXIS);

/**
 * All 9 × 9 placements rendered around their anchors.
 *
 * Uses `mode="manual"` so every popover can stay open simultaneously
 * (`auto` popovers close each other). Click each button to toggle its
 * popover.
 */
export const AllPositions: Story = {
  render: () => {
    const combos: Array<{ label: string; position: string }> = [];
    for (const tb of BLOCK_OPTIONS) {
      for (const ti of INLINE_OPTIONS) {
        // Place popover on the opposite side so it does not overlap.
        const pi: InlinePos = ti === "start" ? "end" : ti === "end" ? "start" : "center";
        const pb: BlockPos = tb === "top" ? "bottom" : tb === "bottom" ? "top" : "middle";
        const position = `${pi} to ${ti} / ${pb} to ${tb}`;
        combos.push({ label: position, position });
      }
    }
    return html`
      ${popoverStyles}
      <div class="shorthand-grid">
        ${combos.map(
          (c, i) => html`
            <div class="cell">
              <button class="demo-anchor" id="all-${i}">${c.label}</button>
              <tp-popover
                class="demo"
                target="#all-${i}"
                position=${c.position}
                mode="manual"
                trigger="click"
              >
                ${c.label}
              </tp-popover>
            </div>
          `,
        )}
      </div>
    `;
  },
};
