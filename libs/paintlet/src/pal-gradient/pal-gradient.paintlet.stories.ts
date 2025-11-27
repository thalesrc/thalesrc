import type { Meta, StoryObj } from '@storybook/web-components';
import { css, html } from 'lit';
import './pal-gradient.paintlet';

/**
 * Story arguments interface for type safety
 */
interface PalGradientStoryArgs {
  colors: string;
  animationDuration?: number;
  complexity: number;
  seed: number;
  compositePoints?: GlobalCompositeOperation;
  compositeLines?: GlobalCompositeOperation;
  width?: number;
  height?: number;
}

const blendingModes: GlobalCompositeOperation[] = [
  'source-over', 'source-in', 'source-out', 'source-atop',
  'destination-over', 'destination-in', 'destination-out', 'destination-atop',
  'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay',
  'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light',
  'soft-light', 'difference', 'exclusion', 'hue', 'saturation',
  'color', 'luminosity'
];

const meta: Meta<PalGradientStoryArgs> = {
  title: 'Paintlets/PAL Gradient',
  tags: ['autodocs'],
  argTypes: {
    colors: {
      control: 'text',
      description: 'Comma-separated list of colors',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'#667eea, #764ba2, #f093fb, #4facfe'" },
      },
    },
    animationDuration: {
      control: { type: 'number', min: 1, max: 100, step: 1 },
      description: 'Duration of the animation in seconds',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
    complexity: {
      control: { type: 'range', min: 3, max: 15, step: 1 },
      description: 'Number of points that create the gradient',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
    seed: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Random seed for generation (change to get different patterns)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '50' },
      },
    },
    compositePoints: {
      control: 'select',
      options: blendingModes,
      description: 'Global composite operation mode for points',
      table: {
        type: { summary: 'GlobalCompositeOperation' },
        defaultValue: { summary: 'lighter' },
      },
    },
    compositeLines: {
      control: 'select',
      options: blendingModes,
      description: 'Global composite operation mode for gradient lines',
      table: {
        type: { summary: 'GlobalCompositeOperation' },
        defaultValue: { summary: 'color-dodge' },
      },
    },
    width: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
      description: 'Width of the container',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '400' },
      },
    },
    height: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
      description: 'Height of the container',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '400' },
      },
    },
  },
  parameters: {
    docs: {

    },
  },
};

export default meta;
type Story = StoryObj<PalGradientStoryArgs>;

/**
 * Render helper function to reduce code duplication
 */
const renderPalGradient = (args: PalGradientStoryArgs) => html`
  <div
    style="
      width: ${args.width || 400}px;
      height: ${args.height || 400}px;
      background-image: --tha-pal-gradient(${args.colors});
      animation: --tha-pal-gradient-animation(${args.animationDuration || 5}s);
      --tha-pal-gradient-complexity: ${args.complexity};
      --tha-pal-gradient-seed: ${args.seed};
      --tha-pal-gradient-composite-points: ${args.compositePoints || 'lighter'};
      --tha-pal-gradient-composite-lines: ${args.compositeLines || 'color-dodge'};
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    "
  ></div>
`;

export const Default: Story = {
  args: {
    colors: "red, green, blue, white, white",
    complexity: 10,
    seed: 70,
    animationDuration: 10,
    compositePoints: "destination-over",
    compositeLines: "difference",
    width: 800,
    height: 800,
  },
  render: renderPalGradient,
  parameters: {
    docs: {
      description: {
        story: 'Default PAL gradient with vibrant purple, blue, and pink colors. Points move in smooth circular paths.',
      },
    },
  },
};

export const ColorfullCircles: Story = {
  args: {
    colors: "yellow, magenta, cyan",
    complexity: 10,
    seed: 81,
    animationDuration: 12,
    compositePoints: "source-over",
    compositeLines: "saturation",
    width: 800,
    height: 800,
  },
  render: renderPalGradient,
  parameters: {
    docs: {
      description: {
        story: 'Colorful circles with yellow, magenta, and cyan. Perfect for vibrant and playful designs.',
      },
    },
  },
};

export const ColorfullCirclesWithColorAnimation: Story = {
  args: {
    colors: "yellow, magenta, cyan",
    complexity: 10,
    seed: 81,
    animationDuration: 12,
    compositePoints: "source-over",
    compositeLines: "saturation",
    width: 800,
    height: 800,
  },
  decorators: (story) => {
    if (document.getElementById('pal-gradient-color-shift')) {
      return story();
    }

    const style = document.createElement('style');
    style.id = 'pal-gradient-color-shift';
    style.textContent = css`
      @keyframes color-shift {
        from {
          --tha-pal-gradient-color-1: #ffff00;
          --tha-pal-gradient-color-2: #ff00ff;
          --tha-pal-gradient-color-3: #00ffff;
        }
        to {
          --tha-pal-gradient-color-1: #ff0000;
          --tha-pal-gradient-color-2: #00ff00;
          --tha-pal-gradient-color-3: #0000ff;
        }
      }
    `.cssText;

    document.head.appendChild(style);
    return story();
  },
  render: args => html`
    <div style="
        width: ${args.width || 400}px;
        height: ${args.height || 400}px;
        background-image: --tha-pal-gradient();
        animation: --tha-pal-gradient-animation(${args.animationDuration || 5}s), color-shift ${args.animationDuration || 5}s infinite alternate;
        --tha-pal-gradient-complexity: ${args.complexity};
        --tha-pal-gradient-seed: ${args.seed};
        --tha-pal-gradient-composite-points: ${args.compositePoints as any || 'lighter'};
        --tha-pal-gradient-composite-lines: ${args.compositeLines as any || 'color-dodge'};
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    "></div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Colorful circles with yellow, magenta, and cyan. Perfect for vibrant and playful designs.',
      },
    },
  },
};

export const Sunburn: Story = {
  args: {
    colors: "red, green",
    complexity: 4,
    seed: 33,
    animationDuration: 10,
    compositePoints: "difference",
    compositeLines: "color-dodge",
    width: 800,
    height: 800
  },

  render: renderPalGradient,

  parameters: {
    docs: {
      description: {
        story: "PAL gradient with red and green creating interesting color interactions through blend modes."
      }
    }
  }
};

export const Mekashine: Story = {
  args: {
    colors: "silver, rgb(from blue r g b / .1), white, rgb(from black r g b / .1)",
    complexity: 5,
    seed: 49,
    animationDuration: 10,
    compositePoints: "destination-over",
    compositeLines: "color-burn",
    width: 800,
    height: 800
  },

  render: renderPalGradient,

  parameters: {
    docs: {
      description: {
        story: "Metallic effect using silver, white, and semi-transparent colors with special blend modes."
      }
    }
  }
};

export const Playground: Story = {
  args: {
    colors: '#667eea, #764ba2, #f093fb, #4facfe',
    complexity: 7,
    seed: 50,
    animationDuration: 10,
    compositePoints: 'screen',
    compositeLines: 'lighter',
    width: 500,
    height: 500,
  },
  render: renderPalGradient,
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all parameters. Try different blend modes, complexities, seeds, and color combinations to create unique effects.',
      },
    },
  },
};
