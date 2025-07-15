import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './drag-element'; // Assuming the element is defined and registered here.

const meta: Meta = {
  title: 'Elements/DragElement',
  component: 'tm-drag',
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
      tm-drag,
      tm-drag-clone {
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
      tm-drag:active {
        cursor: grabbing;
      }
    </style>
    <div class="container">
      <tm-drag replaceclone>Drag Me</tm-drag>
    </div>
  `,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};
