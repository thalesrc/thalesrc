import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './low-poly-mesh.paintlet';

interface LowPolyMeshStoryArgs {
  color1: string;
  color2: string;
  cellSize: number;
  jitter: number;
  seed: number;
  strokeWidth: number;
  strokeColor: string;
  width?: number;
  height?: number;
}

const meta: Meta<LowPolyMeshStoryArgs> = {
  title: 'Paintlets/Low Poly Mesh',
  tags: ['autodocs'],
  argTypes: {
    color1: {
      control: 'color',
      description: 'Base (light) color of the mesh',
      table: { type: { summary: 'string' }, defaultValue: { summary: '#ffffff' } },
    },
    color2: {
      control: 'color',
      description: 'Shadow color blended over the base via per-triangle alpha',
      table: { type: { summary: 'string' }, defaultValue: { summary: '#a8b4c0' } },
    },
    cellSize: {
      control: { type: 'range', min: 16, max: 200, step: 4 },
      description: 'Approximate triangle size in pixels',
      table: { type: { summary: 'number' }, defaultValue: { summary: '60' } },
    },
    jitter: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Vertex jitter amount in [0, 1]',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0.55' } },
    },
    seed: {
      control: { type: 'range', min: 1, max: 100, step: 1 },
      description: 'Seed for the deterministic point distribution',
      table: { type: { summary: 'number' }, defaultValue: { summary: '1' } },
    },
    strokeWidth: {
      control: { type: 'range', min: 0, max: 4, step: 0.25 },
      description: 'Edge line width in pixels (0 disables strokes)',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } },
    },
    strokeColor: {
      control: 'color',
      description: 'Color used for triangle edges when strokeWidth > 0',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'rgba(0,0,0,0.08)' } },
    },
    width: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
      table: { type: { summary: 'number' }, defaultValue: { summary: '480' } },
    },
    height: {
      control: { type: 'range', min: 150, max: 600, step: 50 },
      table: { type: { summary: 'number' }, defaultValue: { summary: '270' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
# Low Poly Mesh Paintlet

Creates a triangulated mesh background reminiscent of crumpled paper or
faceted low-poly art using the CSS Paint API.

## CSS Custom Properties

- \`--tp-low-poly-color-1\`: Base (light) color
- \`--tp-low-poly-color-2\`: Shadow color
- \`--tp-low-poly-cell-size\`: Approximate triangle size in px
- \`--tp-low-poly-jitter\`: Vertex jitter amount in [0, 1]
- \`--tp-low-poly-seed\`: Deterministic seed
- \`--tp-low-poly-stroke-width\`: Edge line width in px (0 disables)
- \`--tp-low-poly-stroke-color\`: Edge color

## Browser Support

CSS Paint API is supported in:
- Chrome/Edge 65+
- Opera 52+
- Safari 15.4+
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<LowPolyMeshStoryArgs>;

const renderMesh = (args: LowPolyMeshStoryArgs) => html`
  <div
    style="
      width: ${args.width || 480}px;
      height: ${args.height || 270}px;
      background-image: --tp-low-poly-mesh();
      --tp-low-poly-color-1: ${args.color1};
      --tp-low-poly-color-2: ${args.color2};
      --tp-low-poly-cell-size: ${args.cellSize};
      --tp-low-poly-jitter: ${args.jitter};
      --tp-low-poly-seed: ${args.seed};
      --tp-low-poly-stroke-width: ${args.strokeWidth};
      --tp-low-poly-stroke-color: ${args.strokeColor};
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    "
  ></div>
`;

export const Default: Story = {
  args: {
    color1: '#ffffff',
    color2: '#a8b4c0',
    cellSize: 60,
    jitter: 0.55,
    seed: 1,
    strokeWidth: 0,
    strokeColor: 'rgba(0,0,0,0.08)',
    width: 480,
    height: 270,
  },
  render: renderMesh,
};

export const PaperCrumple: Story = {
  args: {
    color1: '#f5f7fa',
    color2: '#8395a7',
    cellSize: 70,
    jitter: 0.7,
    seed: 7,
    strokeWidth: 0,
    strokeColor: 'rgba(0,0,0,0.08)',
    width: 480,
    height: 270,
  },
  render: renderMesh,
  parameters: {
    docs: { description: { story: 'Cool gray palette inspired by the reference image.' } },
  },
};

export const SunsetFacets: Story = {
  args: {
    color1: '#ffd6a5',
    color2: '#bd3253',
    cellSize: 50,
    jitter: 0.6,
    seed: 12,
    strokeWidth: 0,
    strokeColor: 'rgba(0,0,0,0.08)',
    width: 480,
    height: 270,
  },
  render: renderMesh,
};

export const TightWireframe: Story = {
  args: {
    color1: '#ffffff',
    color2: '#cfd8dc',
    cellSize: 36,
    jitter: 0.45,
    seed: 3,
    strokeWidth: 1,
    strokeColor: 'rgba(0,0,0,0.18)',
    width: 480,
    height: 270,
  },
  render: renderMesh,
  parameters: {
    docs: { description: { story: 'Dense triangles with visible wireframe edges.' } },
  },
};

interface JitterAnimationArgs extends LowPolyMeshStoryArgs {
  duration: number;
}

export const JitterAnimation: StoryObj<JitterAnimationArgs> = {
  argTypes: {
    duration: {
      control: { type: 'range', min: 1, max: 10, step: 0.5 },
      description: 'Animation duration in seconds',
      table: { type: { summary: 'number' }, defaultValue: { summary: '4' } },
    },
  },
  args: {
    color1: '#ffffff',
    color2: '#8395a7',
    cellSize: 60,
    jitter: 0.3,
    seed: 5,
    strokeWidth: 0,
    strokeColor: 'rgba(0,0,0,0.08)',
    width: 480,
    height: 270,
    duration: 4,
  },
  render: (args) => html`
    <style>
      @keyframes tp-low-poly-jitter-pulse {
        from { --tp-low-poly-jitter: 0.3; }
        to   { --tp-low-poly-jitter: 0.9; }
      }
    </style>
    <div
      style="
        width: ${args.width || 480}px;
        height: ${args.height || 270}px;
        background-image: --tp-low-poly-mesh();
        --tp-low-poly-color-1: ${args.color1};
        --tp-low-poly-color-2: ${args.color2};
        --tp-low-poly-cell-size: ${args.cellSize};
        --tp-low-poly-jitter: ${args.jitter};
        --tp-low-poly-seed: ${args.seed};
        --tp-low-poly-stroke-width: ${args.strokeWidth};
        --tp-low-poly-stroke-color: ${args.strokeColor};
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
        animation: tp-low-poly-jitter-pulse ${args.duration}s linear infinite alternate;
      "
    ></div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Animates `--tp-low-poly-jitter` from `0.3` to `0.9` and back using an `linear` curve. ' +
          'Animation is enabled because the property is registered via `@property` with `<number>` syntax.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    color1: '#ffffff',
    color2: '#9fb1c2',
    cellSize: 60,
    jitter: 0.55,
    seed: 1,
    strokeWidth: 0,
    strokeColor: 'rgba(0,0,0,0.08)',
    width: 480,
    height: 270,
  },
  render: renderMesh,
};
