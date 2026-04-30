import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "./details-set-element";

const meta: Meta = {
  title: "Elements/DetailsSet",
  component: "tp-details-set",
  tags: ["autodocs"],
  argTypes: {
    maxOpenItems: {
      control: { type: "number", min: 0, step: 1 },
      description: "Max direct-child `<details>` allowed open. 0 = unlimited.",
    },
  },
  render: ({ maxOpenItems = 0 }) => html`
    <style>
      .container {
        max-width: 32rem;
        font-family: system-ui, sans-serif;
      }
      tp-details-set > details {
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        margin-block: 0.5rem;
        background: white;
      }
      tp-details-set > details > summary {
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        list-style: none;
      }
      tp-details-set > details > summary::-webkit-details-marker {
        display: none;
      }
      tp-details-set > details > div {
        padding: 0 1rem 0.75rem;
        color: #3f3f46;
      }
    </style>
    <div class="container">
      <tp-details-set max-open-items=${maxOpenItems}>
        <details>
          <summary>Section A</summary>
          <div>Content for section A.</div>
        </details>
        <details>
          <summary>Section B</summary>
          <div>Content for section B.</div>
        </details>
        <details>
          <summary>Section C</summary>
          <div>Content for section C.</div>
        </details>
        <details>
          <summary>Section D</summary>
          <div>Content for section D.</div>
        </details>
      </tp-details-set>
    </div>
  `,
};

export default meta;

type Story = StoryObj<{ maxOpenItems: number }>;

export const Unlimited: Story = {
  args: { maxOpenItems: 0 },
};

export const Accordion: Story = {
  args: { maxOpenItems: 1 },
};

export const TwoAtATime: Story = {
  args: { maxOpenItems: 2 },
};

export const PreOpened: Story = {
  args: { maxOpenItems: 2 },
  render: ({ maxOpenItems }) => html`
    <div style="max-width: 32rem; font-family: system-ui, sans-serif;">
      <tp-details-set max-open-items=${maxOpenItems}>
        <details open>
          <summary>Section A (initially open)</summary>
          <div>Content for section A.</div>
        </details>
        <details open>
          <summary>Section B (initially open)</summary>
          <div>Content for section B.</div>
        </details>
        <details>
          <summary>Section C</summary>
          <div>Content for section C. Opening this evicts Section A.</div>
        </details>
      </tp-details-set>
    </div>
  `,
};

export const CustomTransition: Story = {
  args: { maxOpenItems: 1 },
  render: ({ maxOpenItems }) => html`
    <style>
      tp-details-set.snappy {
        --tp-details-set-transition-duration: 0.12s;
        --tp-details-set-transition-easing: cubic-bezier(0.2, 0, 0, 1);
      }
    </style>
    <div style="max-width: 32rem; font-family: system-ui, sans-serif;">
      <tp-details-set class="snappy" max-open-items=${maxOpenItems}>
        <details>
          <summary>Snappy A</summary>
          <div>Faster transition via CSS custom properties.</div>
        </details>
        <details>
          <summary>Snappy B</summary>
          <div>Faster transition via CSS custom properties.</div>
        </details>
      </tp-details-set>
    </div>
  `,
};

export const WithChevronMarker: Story = {
  args: { maxOpenItems: 1 },
  render: ({ maxOpenItems }) => html`
    <style>
      .marker-demo > details {
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        margin-block: 0.5rem;
        background: white;
      }
      .marker-demo > details > summary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        list-style: none;
      }
      .marker-demo > details > summary::-webkit-details-marker { display: none; }
      .marker-demo > details > summary > .chev {
        display: inline-block;
        transition: rotate 0.2s ease;
      }
      .marker-demo > details[open] > summary > .chev { rotate: 90deg; }
      .marker-demo > details > div { padding: 0 1rem 0.75rem; color: #3f3f46; }
    </style>
    <div style="max-width: 32rem; font-family: system-ui, sans-serif;">
      <tp-details-set class="marker-demo" max-open-items=${maxOpenItems}>
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details>
          <summary>Section A</summary>
          <div>Content A.</div>
        </details>
        <details>
          <summary>Section B</summary>
          <div>Content B.</div>
        </details>
        <details>
          <summary>Section C</summary>
          <div>Content C.</div>
        </details>
      </tp-details-set>
    </div>
  `,
};

export const WithLeadingAndTrailingMarkers: Story = {
  args: { maxOpenItems: 0 },
  render: ({ maxOpenItems }) => html`
    <style>
      .marker-demo-2 > details {
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        margin-block: 0.5rem;
        background: white;
      }
      .marker-demo-2 > details > summary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        list-style: none;
      }
      .marker-demo-2 > details > summary::-webkit-details-marker { display: none; }
      .marker-demo-2 > details > summary > .badge {
        margin-inline-start: auto;
        font-size: 0.75rem;
        padding: 0.125rem 0.5rem;
        border-radius: 999px;
        background: #fde68a;
        color: #78350f;
      }
      .marker-demo-2 > details > div { padding: 0 1rem 0.75rem; color: #3f3f46; }
    </style>
    <div style="max-width: 32rem; font-family: system-ui, sans-serif;">
      <tp-details-set class="marker-demo-2" max-open-items=${maxOpenItems}>
        <template summary-marker index="0"><span>▸</span></template>
        <template summary-marker index="999"><span class="badge">new</span></template>
        <details>
          <summary>Profile</summary>
          <div>Profile content.</div>
        </details>
        <details>
          <summary>Settings</summary>
          <div>Settings content.</div>
        </details>
      </tp-details-set>
    </div>
  `,
};

export const MarkerOnlyToggle: Story = {
  args: { maxOpenItems: 0 },
  render: ({ maxOpenItems }) => html`
    <style>
      .marker-only > details {
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        margin-block: 0.5rem;
        background: white;
      }
      .marker-only > details > summary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        cursor: default;
        font-weight: 600;
      }
      .marker-only > details > summary > [tp-summary-marker] {
        cursor: pointer;
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        transition: background 0.15s ease, rotate 0.2s ease;
      }
      .marker-only > details > summary > [tp-summary-marker]:hover {
        background: #f4f4f5;
      }
      .marker-only > details[open] > summary > [tp-summary-marker] { rotate: 90deg; }
      .marker-only > details > div { padding: 0 1rem 0.75rem; color: #3f3f46; }
    </style>
    <div style="max-width: 32rem; font-family: system-ui, sans-serif;">
      <p style="color:#52525b">Only the chevron toggles the section.</p>
      <tp-details-set class="marker-only" toggle-on="marker" max-open-items=${maxOpenItems}>
        <template summary-marker index="0"><span>▸</span></template>
        <details><summary>Section A</summary><div>Content A.</div></details>
        <details><summary>Section B</summary><div>Content B.</div></details>
        <details><summary>Section C</summary><div>Content C.</div></details>
      </tp-details-set>
    </div>
  `,
};

export const MixedToggleModes: Story = {
  args: { maxOpenItems: 0 },
  render: ({ maxOpenItems }) => html`
    <style>
      .mixed > details {
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        margin-block: 0.5rem;
        background: white;
      }
      .mixed > details > summary {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        font-weight: 600;
      }
      .mixed > details > summary > [tp-summary-marker] {
        cursor: pointer;
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
      }
      .mixed > details > summary > [tp-summary-marker]:hover { background: #f4f4f5; }
      .mixed > details > div { padding: 0 1rem 0.75rem; color: #3f3f46; }
    </style>
    <div style="max-width: 32rem; font-family: system-ui, sans-serif;">
      <p style="color:#52525b">
        Set default is <code>marker</code>; the second details opts back into
        full-summary toggling.
      </p>
      <tp-details-set class="mixed" toggle-on="marker" max-open-items=${maxOpenItems}>
        <template summary-marker index="0"><span>▸</span></template>
        <details>
          <summary>Marker only</summary>
          <div>Click the chevron.</div>
        </details>
        <details toggle-on="summary">
          <summary>Whole-summary toggleable</summary>
          <div>Click anywhere on the summary.</div>
        </details>
      </tp-details-set>
    </div>
  `,
};
