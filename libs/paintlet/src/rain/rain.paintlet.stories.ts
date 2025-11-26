import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rain.paintlet';

/**
 * Story arguments interface for type safety
 */
interface RainStoryArgs {
  speed: number;
  color: string;
  density: number;
  angle: number;
  minLength: number;
  maxLength: number;
  minThickness: number;
  maxThickness: number;
  width?: number;
  height?: number;
}

const meta: Meta<RainStoryArgs> = {
  title: 'Paintlets/Rain',
  tags: ['autodocs'],
  argTypes: {
    speed: {
      control: { type: 'range', min: 0.1, max: 5, step: 0.1 },
      description: 'Speed multiplier for rain animation',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    color: {
      control: 'color',
      description: 'The color of the raindrops',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#4a90e2' },
      },
    },
    density: {
      control: { type: 'range', min: 10, max: 200, step: 5 },
      description: 'Number of raindrops',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '50' },
      },
    },
    angle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      description: 'Angle of rain in degrees (90 is vertical)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '275' },
      },
    },
    minLength: {
      control: { type: 'range', min: 5, max: 30, step: 1 },
      description: 'Minimum length of raindrops in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '10' },
      },
    },
    maxLength: {
      control: { type: 'range', min: 20, max: 80, step: 1 },
      description: 'Maximum length of raindrops in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '30' },
      },
    },
    minThickness: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.1 },
      description: 'Minimum thickness of raindrops',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    maxThickness: {
      control: { type: 'range', min: 1, max: 5, step: 0.1 },
      description: 'Maximum thickness of raindrops',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    width: {
      control: { type: 'range', min: 200, max: 600, step: 50 },
      description: 'Width of the container',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '400' },
      },
    },
    height: {
      control: { type: 'range', min: 200, max: 600, step: 50 },
      description: 'Height of the container',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '400' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
# Rain Paintlet

Creates an animated rain effect using CSS Paint API and CSS animations.

## CSS Custom Properties

- \`--tha-rain-color\`: Color of the raindrops
- \`--tha-rain-density\`: Number of raindrops
- \`--tha-rain-angle\`: Angle of rain in degrees (90 is vertical)
- \`--tha-rain-min-length\`: Minimum length of raindrops in pixels
- \`--tha-rain-max-length\`: Maximum length of raindrops in pixels
- \`--tha-rain-min-thickness\`: Minimum thickness of raindrops
- \`--tha-rain-max-thickness\`: Maximum thickness of raindrops
- \`--tha-rain-frame\`: Animation frame from 0 to 1000 (use with CSS animation)

## Animation

The rain paintlet automatically registers a \`tha-rain-animation\` keyframe animation:

\`\`\`css
.rain-effect {
  background-image: paint(rain);
  animation: --tha-rain-animation(1s);
}
\`\`\`

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
type Story = StoryObj<RainStoryArgs>;

/**
 * Render helper function to reduce code duplication
 */
const renderRain = (args: RainStoryArgs) => html`
  <style>
    .rain-container {
      width: ${args.width || 400}px;
      height: ${args.height || 400}px;
      background-image: --tha-rain();
      --tha-rain-color: ${args.color};
      --tha-rain-density: ${args.density};
      --tha-rain-angle: ${args.angle};
      --tha-rain-min-length: ${args.minLength};
      --tha-rain-max-length: ${args.maxLength};
      --tha-rain-min-thickness: ${args.minThickness};
      --tha-rain-max-thickness: ${args.maxThickness};
      animation: --tha-rain-animation(${args.speed}s);
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background-color: #f0f4f8;
    }
  </style>
  <div class="rain-container"></div>
`;

export const Default: Story = {
  args: {
    speed: 1,
    color: '#4a90e2',
    density: 50,
    angle: 75,
    minLength: 10,
    maxLength: 30,
    minThickness: 1,
    maxThickness: 2,
    width: 400,
    height: 400,
  },
  render: renderRain,
  parameters: {
    docs: {
      description: {
        story: 'Default rain effect with moderate density and speed.',
      },
    },
  },
};

export const HeavyRain: Story = {
  args: {
    speed: 5,
    color: '#2c5aa0',
    density: 120,
    angle: 70,
    minLength: 15,
    maxLength: 40,
    minThickness: 1.5,
    maxThickness: 3,
    width: 400,
    height: 400,
  },
  render: renderRain,
  parameters: {
    docs: {
      description: {
        story: 'Heavy rain with high density and faster speed.',
      },
    },
  },
};

export const LightDrizzle: Story = {
  args: {
    speed: 0.5,
    color: '#87ceeb',
    density: 25,
    angle: 85,
    minLength: 8,
    maxLength: 15,
    minThickness: 0.8,
    maxThickness: 1.5,
    width: 400,
    height: 400,
  },
  render: renderRain,
  parameters: {
    docs: {
      description: {
        story: 'Light drizzle with fewer, shorter raindrops falling more vertically.',
      },
    },
  },
};

export const Storm: Story = {
  args: {
    speed: 3,
    color: '#1a1a2e',
    density: 150,
    angle: 60,
    minLength: 20,
    maxLength: 60,
    minThickness: 2,
    maxThickness: 4,
    width: 400,
    height: 400,
  },
  render: renderRain,
  parameters: {
    docs: {
      description: {
        story: 'Intense storm with heavy, angled rain.',
      },
    },
  },
};

export const ColorfulRain: Story = {
  args: {
    speed: 1,
    color: '#ff6b9d',
    density: 60,
    angle: 80,
    minLength: 12,
    maxLength: 25,
    minThickness: 1.2,
    maxThickness: 2.5,
    width: 400,
    height: 400,
  },
  render: renderRain,
  parameters: {
    docs: {
      description: {
        story: 'Creative colorful rain effect for artistic designs.',
      },
    },
  },
};

export const Vertical: Story = {
  args: {
    speed: 1,
    color: '#4a90e2',
    density: 80,
    angle: 90,
    minLength: 15,
    maxLength: 35,
    minThickness: 1,
    maxThickness: 2,
    width: 400,
    height: 400,
  },
  render: renderRain,
  parameters: {
    docs: {
      description: {
        story: 'Perfectly vertical rain with no angle.',
      },
    },
  },
};

export const Playground: Story = {
  args: {
    speed: 1,
    color: '#4a90e2',
    density: 70,
    angle: 75,
    minLength: 10,
    maxLength: 30,
    minThickness: 1,
    maxThickness: 2,
    width: 450,
    height: 450,
  },
  render: renderRain,
  parameters: {
    docs: {
      description: {
        story: 'Experiment with different combinations of parameters to create your own rain effect.',
      },
    },
  },
};
