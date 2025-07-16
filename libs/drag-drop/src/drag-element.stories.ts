import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './drag-element'; // Assuming the element is defined and registered here.

const meta: Meta = {
  title: 'Elements/DragElement',
  component: 'tha-drag',
  tags: ['autodocs'],
  argTypes: {
    // Define arg types for component properties if any
  },
  render: (args) => html`
    <style>
      .container {
        width: 100%;
        height: 80vh;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      tha-drag,
      tha-drag-clone {
        width: 150px;
        height: 150px;
        background-color: dodgerblue;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        user-select: none;
        border-radius: 8px;
      }
      tha-drag:active {
        cursor: grabbing;
      }
    </style>
    <div class="container">
      <tha-drag replaceclone>Drag Me</tha-drag>
    </div>
  `,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};
