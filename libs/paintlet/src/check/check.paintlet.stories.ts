import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './check.paintlet';

interface CheckStoryArgs {
  cellSize: number;
  cellWidth: string;
  cellHeight: string;
  strokeWidth: number;
  strokeWidthH: string;
  strokeWidthV: string;
  strokeColor: string;
  strokeColorH: string;
  strokeColorV: string;
  width: number;
  height: number;
}

const meta: Meta<CheckStoryArgs> = {
  title: 'Paintlets/Check',
  tags: ['autodocs'],
  argTypes: {
    cellSize: {
      control: { type: 'range', min: 2, max: 100, step: 1 },
      description: 'Uniform cell size (overridden by cellWidth/cellHeight)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '20' },
      },
    },
    cellWidth: {
      control: 'text',
      description: 'Horizontal spacing between vertical lines (auto = inherit cell-size, supports percentage)',
      table: {
        type: { summary: 'number | percentage | auto' },
        defaultValue: { summary: 'auto' },
      },
    },
    cellHeight: {
      control: 'text',
      description: 'Vertical spacing between horizontal lines (auto = inherit cell-size, supports percentage)',
      table: {
        type: { summary: 'number | percentage | auto' },
        defaultValue: { summary: 'auto' },
      },
    },
    strokeWidth: {
      control: { type: 'range', min: 0.1, max: 20, step: 0.1 },
      description: 'Uniform stroke width for all lines',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0.5' },
      },
    },
    strokeWidthH: {
      control: 'text',
      description: 'Stroke width for horizontal lines (auto = inherit stroke-width)',
      table: {
        type: { summary: 'number | auto' },
        defaultValue: { summary: 'auto' },
      },
    },
    strokeWidthV: {
      control: 'text',
      description: 'Stroke width for vertical lines (auto = inherit stroke-width)',
      table: {
        type: { summary: 'number | auto' },
        defaultValue: { summary: 'auto' },
      },
    },
    strokeColor: {
      control: 'color',
      description: 'Uniform stroke color for all lines',
      table: {
        type: { summary: 'color' },
        defaultValue: { summary: '#333333' },
      },
    },
    strokeColorH: {
      control: 'text',
      description: 'Color for horizontal lines (auto = inherit stroke-color)',
      table: {
        type: { summary: 'color | auto' },
        defaultValue: { summary: 'auto' },
      },
    },
    strokeColorV: {
      control: 'text',
      description: 'Color for vertical lines (auto = inherit stroke-color)',
      table: {
        type: { summary: 'color | auto' },
        defaultValue: { summary: 'auto' },
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
# Check Paintlet

Creates a grid-line pattern with horizontal and vertical lines using CSS Paint API.

## Option Drawbacks

Each custom property comes with trade-offs. The stories below demonstrate what can go wrong
or look unexpected with certain configurations.

## CSS Custom Properties

| Property | Default | Notes |
|---|---|---|
| \`--tp-check-cell-size\` | \`20\` | Uniform cell size, overridden by cell-width/cell-height |
| \`--tp-check-cell-width\` | \`auto\` | Falls back to cell-size when auto |
| \`--tp-check-cell-height\` | \`auto\` | Falls back to cell-size when auto |
| \`--tp-check-stroke-width\` | \`.5\` | Uniform stroke width |
| \`--tp-check-stroke-width-h\` | \`auto\` | Falls back to stroke-width when auto |
| \`--tp-check-stroke-width-v\` | \`auto\` | Falls back to stroke-width when auto |
| \`--tp-check-stroke-color\` | \`#333333\` | Uniform stroke color |
| \`--tp-check-stroke-color-h\` | \`auto\` | Falls back to stroke-color when auto |
| \`--tp-check-stroke-color-v\` | \`auto\` | Falls back to stroke-color when auto |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<CheckStoryArgs>;

const renderCheck = (args: CheckStoryArgs) => html`
  <div
    style="
      width: ${args.width}px;
      height: ${args.height}px;
      background-image: --tp-check();
      --tp-check-cell-size: ${args.cellSize};
      --tp-check-cell-width: ${args.cellWidth};
      --tp-check-cell-height: ${args.cellHeight};
      --tp-check-stroke-width: ${args.strokeWidth};
      --tp-check-stroke-width-h: ${args.strokeWidthH};
      --tp-check-stroke-width-v: ${args.strokeWidthV};
      --tp-check-stroke-color: ${args.strokeColor};
      --tp-check-stroke-color-h: ${args.strokeColorH};
      --tp-check-stroke-color-v: ${args.strokeColorV};
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    "
  ></div>
`;

/**
 * Default grid with sensible settings.
 */
export const Default: Story = {
  args: {
    cellSize: 20,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 0.5,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#333333',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 300,
    height: 300,
  },
  render: renderCheck,
};

/**
 * When stroke width is too large relative to cell size, lines overlap heavily
 * and the grid becomes an opaque filled block instead of a pattern.
 */
export const ThickStrokeOverlap: Story = {
  args: {
    cellSize: 10,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 8,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#333333',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 300,
    height: 300,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'Stroke width (8) is close to cell size (10). Lines overlap heavily, turning the grid into an almost solid fill.',
      },
    },
  },
};

/**
 * At very small cell sizes the grid is so dense it looks like a solid color
 * with moirÃ© artifacts depending on display DPI.
 */
export const TinyCellMoire: Story = {
  args: {
    cellSize: 3,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 0.5,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#444444',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 300,
    height: 300,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'Cell size of 3px creates a grid so dense it produces moirÃ© patterns on most screens. The individual lines become indistinguishable.',
      },
    },
  },
};

/**
 * Very large cell size means only 1-2 lines are visible, barely forming a grid.
 */
export const HugeCellSparse: Story = {
  args: {
    cellSize: 90,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 0.5,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#333333',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 300,
    height: 300,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'Cell size larger than half the container leaves only a few lines. The pattern barely reads as a grid.',
      },
    },
  },
};

/**
 * Extremely unequal cell-width vs cell-height creates a stretched,
 * distorted grid that may look unintentional.
 */
export const ExtremeAspectRatio: Story = {
  args: {
    cellSize: 20,
    cellWidth: '80',
    cellHeight: '8',
    strokeWidth: 1,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#555555',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 400,
    height: 300,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'Cell width 80 vs cell height 8 produces a 10:1 aspect ratio. Horizontal lines dominate while vertical lines are sparse, losing the "check" feel.',
      },
    },
  },
};

/**
 * When horizontal and vertical stroke widths differ drastically the
 * intersections look unbalanced and jagged.
 */
export const MismatchedStrokeWidths: Story = {
  args: {
    cellSize: 25,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 1,
    strokeWidthH: '8',
    strokeWidthV: '0.5',
    strokeColor: '#333333',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 300,
    height: 300,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'Horizontal stroke width 8 vs vertical 0.5 makes intersections look oddly notched â€” the thin vertical lines almost disappear against the thick horizontals.',
      },
    },
  },
};

/**
 * Different colors for H and V lines produce visible blending artifacts
 * at intersections where both lines cross.
 */
export const IntersectionColorBleed: Story = {
  args: {
    cellSize: 30,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 3,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#333333',
    strokeColorH: '#e74c3c',
    strokeColorV: '#3498db',
    width: 300,
    height: 300,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'Red horizontal and blue vertical lines overlap at intersections. Because vertical lines are drawn after horizontal ones, the vertical color always wins at crossings â€” there is no true blending.',
      },
    },
  },
};

/**
 * Using a percentage cell-size ties the grid to container dimensions.
 * Resizing the container changes the grid density unpredictably.
 */
export const PercentageCellSize: Story = {
  args: {
    cellSize: 20,
    cellWidth: '10%',
    cellHeight: '10%',
    strokeWidth: 1,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#333333',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 300,
    height: 200,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'Cell width and height set to 10%. On a 300Ã—200 container this means 30px wide Ã— 20px tall cells â€” the grid is square-ish. But resize the container and the proportions shift in non-obvious ways.',
      },
    },
  },
};

/**
 * Semi-transparent stroke color reveals overlap intensity at intersections.
 */
export const TransparentOverlap: Story = {
  args: {
    cellSize: 25,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 4,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: 'rgba(0, 0, 0, 0.15)',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 300,
    height: 300,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story:
          'With semi-transparent strokes, intersections are visibly darker than line segments because both horizontal and vertical paints accumulate opacity.',
      },
    },
  },
};

/**
 * Experiment freely â€” use the controls panel to discover more drawbacks.
 */
export const Playground: Story = {
  args: {
    cellSize: 20,
    cellWidth: 'auto',
    cellHeight: 'auto',
    strokeWidth: 0.5,
    strokeWidthH: 'auto',
    strokeWidthV: 'auto',
    strokeColor: '#333333',
    strokeColorH: 'auto',
    strokeColorV: 'auto',
    width: 400,
    height: 400,
  },
  render: renderCheck,
  parameters: {
    docs: {
      description: {
        story: 'Open the controls panel and push values to extremes to discover more edge cases.',
      },
    },
  },
};
