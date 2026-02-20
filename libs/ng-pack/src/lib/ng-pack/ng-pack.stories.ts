import type { Meta, StoryObj } from '@storybook/angular';
import { NgPack } from './ng-pack';

const meta: Meta<NgPack> = {
  title: 'NgPack/NgPack Component',
  component: NgPack,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<NgPack>;

export const Default: Story = {
  args: {},
};

export const CustomTemplate: Story = {
  render: () => ({
    template: `
      <tng-ng-pack></tng-ng-pack>
      <p>This is the default NgPack component from @telperion/ng-pack</p>
    `,
  }),
};
