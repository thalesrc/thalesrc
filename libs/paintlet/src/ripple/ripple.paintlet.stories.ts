import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './ripple.paintlet';

/**
 * Story arguments interface for type safety
 */
interface RippleStoryArgs {
  color: string;
  density: number;
  waveWidth: number;
  width?: number;
  height?: number;
}

const meta: Meta<RippleStoryArgs> = {
  title: 'Paintlets/Ripple',
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'color',
      description: 'The color of the ripple waves',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#3498db' },
      },
    },
    density: {
      control: { type: 'range', min: 3, max: 20, step: 1 },
      description: 'Number of ripple waves',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
    waveWidth: {
      control: { type: 'range', min: 1, max: 10, step: 0.5 },
      description: 'Width of each wave line in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    width: {
      control: { type: 'range', min: 100, max: 600, step: 50 },
      description: 'Width of the container',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '300' },
      },
    },
    height: {
      control: { type: 'range', min: 100, max: 600, step: 50 },
      description: 'Height of the container',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '300' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
# Ripple Paintlet

Creates concentric circular waves radiating from the center using CSS Paint API.

## CSS Custom Properties

- \`--tha-ripple-color\`: Color of the ripple waves
- \`--tha-ripple-density\`: Number of ripple waves
- \`--tha-ripple-wave-width\`: Width of each wave line in pixels

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
type Story = StoryObj<RippleStoryArgs>;

/**
 * Render helper function to reduce code duplication
 */
const renderRipple = (args: RippleStoryArgs) => html`
  <div
    style="
      width: ${args.width || 300}px;
      height: ${args.height || 300}px;
      background-image: paint(ripple);
      --tha-ripple-color: ${args.color};
      --tha-ripple-density: ${args.density};
      --tha-ripple-wave-width: ${args.waveWidth};
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    "
  ></div>
`;

export const Default: Story = {
  args: {
    color: '#3498db',
    density: 5,
    waveWidth: 2,
    width: 300,
    height: 300,
  },
  render: renderRipple,
};

export const HighDensity: Story = {
  args: {
    color: '#e74c3c',
    density: 15,
    waveWidth: 1,
    width: 300,
    height: 300,
  },
  render: renderRipple,
  parameters: {
    docs: {
      description: {
        story: 'More ripples with thinner lines create a denser pattern.',
      },
    },
  },
};

export const ThickWaves: Story = {
  args: {
    color: '#2ecc71',
    density: 6,
    waveWidth: 5,
    width: 300,
    height: 300,
  },
  render: renderRipple,
  parameters: {
    docs: {
      description: {
        story: 'Bold, thick waves create a strong visual impact.',
      },
    },
  },
};

export const Rainbow: Story = {
  args: {
    color: '#9b59b6',
    density: 10,
    waveWidth: 3,
    width: 400,
    height: 400,
  },
  render: renderRipple,
  parameters: {
    docs: {
      description: {
        story: 'A balanced composition with medium density and wave width.',
      },
    },
  },
};

export const Minimal: Story = {
  args: {
    color: '#95a5a6',
    density: 3,
    waveWidth: 1.5,
    width: 200,
    height: 200,
  },
  render: renderRipple,
  parameters: {
    docs: {
      description: {
        story: 'Minimal design with just a few subtle ripples.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    color: '#3498db',
    density: 8,
    waveWidth: 2,
    width: 350,
    height: 350,
  },
  render: renderRipple,
  parameters: {
    docs: {
      description: {
        story: 'Experiment with different combinations of parameters.',
      },
    },
  },
};
