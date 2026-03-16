import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './ellipse-gradient.paintlet';

interface EllipseGradientStoryArgs {
  startColor: string;
  endColor: string;
  stretch: number;
  angle: number;
  width?: number;
  height?: number;
}

const meta: Meta<EllipseGradientStoryArgs> = {
  title: 'Paintlets/Ellipse Gradient',
  tags: ['autodocs'],
  argTypes: {
    startColor: {
      control: 'color',
      description: 'Center color of the ellipse gradient',
      table: {
        type: { summary: 'color' },
        defaultValue: { summary: '#000000' },
      },
    },
    endColor: {
      control: 'color',
      description: 'Edge color of the ellipse gradient',
      table: {
        type: { summary: 'color' },
        defaultValue: { summary: 'transparent' },
      },
    },
    stretch: {
      control: { type: 'range', min: 0.2, max: 5, step: 0.1 },
      description: 'Stretch factor (1 = circle, >1 = elongated)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1.6' },
      },
    },
    angle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      description: 'Stretch direction in degrees',
      table: {
        type: { summary: 'angle' },
        defaultValue: { summary: '0deg' },
      },
    },
    width: {
      control: { type: 'range', min: 100, max: 800, step: 50 },
      description: 'Width of the container',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '400' },
      },
    },
    height: {
      control: { type: 'range', min: 100, max: 800, step: 50 },
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
# Ellipse Gradient Paintlet

Creates a single elliptical radial gradient using CSS Paint API.

## CSS Custom Properties

| Property | Default | Description |
|---|---|---|
| \`--tp-ellipse-gradient-start-color\` | \`#000000\` | Center color |
| \`--tp-ellipse-gradient-end-color\` | \`transparent\` | Edge color |
| \`--tp-ellipse-gradient-stretch\` | \`1.6\` | Elongation factor (1 = circle) |
| \`--tp-ellipse-gradient-angle\` | \`0deg\` | Stretch direction (CSS angle) |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<EllipseGradientStoryArgs>;

const renderEllipseGradient = (args: EllipseGradientStoryArgs) => html`
  <div
    style="
      width: ${args.width || 400}px;
      height: ${args.height || 400}px;
      background-image: paint(tp-ellipse-gradient);
      --tp-ellipse-gradient-start-color: ${args.startColor};
      --tp-ellipse-gradient-end-color: ${args.endColor};
      --tp-ellipse-gradient-stretch: ${args.stretch};
      --tp-ellipse-gradient-angle: ${args.angle}deg;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    "
  ></div>
`;

export const Default: Story = {
  args: {
    startColor: '#000000',
    endColor: 'transparent',
    stretch: 1.6,
    angle: 0,
    width: 400,
    height: 400,
  },
  render: renderEllipseGradient,
};

export const Tilted: Story = {
  args: {
    startColor: '#000000',
    endColor: 'transparent',
    stretch: 2.5,
    angle: 45,
    width: 400,
    height: 400,
  },
  render: renderEllipseGradient,
};

export const ColorfulSoft: Story = {
  args: {
    startColor: '#667eea',
    endColor: '#f5f5f5',
    stretch: 1.8,
    angle: 120,
    width: 400,
    height: 400,
  },
  render: renderEllipseGradient,
};

export const Circle: Story = {
  args: {
    startColor: '#e74c3c',
    endColor: 'transparent',
    stretch: 1,
    angle: 0,
    width: 400,
    height: 400,
  },
  render: renderEllipseGradient,
  parameters: {
    docs: {
      description: {
        story: 'With stretch = 1, the result is a perfect circle.',
      },
    },
  },
};

export const NarrowBeam: Story = {
  args: {
    startColor: '#1a1a2e',
    endColor: 'transparent',
    stretch: 4,
    angle: 90,
    width: 400,
    height: 400,
  },
  render: renderEllipseGradient,
  parameters: {
    docs: {
      description: {
        story: 'High stretch with vertical angle creates a narrow beam effect.',
      },
    },
  },
};
