import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { FieldModule } from './field.module';
import { CheckFieldComponent } from './check-field.component';

const meta: Meta<CheckFieldComponent> = {
  title: 'Form/CheckField',
  component: CheckFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [FieldModule],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
  },
  args: {
    label: '',
    hint: '',
  },
};

export default meta;
type Story = StoryObj<CheckFieldComponent>;

export const Checkbox: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tui-check-field [label]="label" [hint]="hint">
        <input type="checkbox" name="agree" ngModel />
        <span>I agree to the terms and conditions</span>
      </tui-check-field>
    `,
  }),
};

export const RequiredCheckbox: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tui-check-field [label]="label" [hint]="hint">
        <input type="checkbox" name="agree" ngModel required />
        <span>I agree (required)</span>
      </tui-check-field>
    `,
  }),
};

export const Radio: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-2">
        <tui-check-field [label]="label" [hint]="hint">
          <input type="radio" name="plan" value="free" ngModel />
          <span>Free</span>
        </tui-check-field>
        <tui-check-field>
          <input type="radio" name="plan" value="pro" ngModel />
          <span>Pro</span>
        </tui-check-field>
        <tui-check-field>
          <input type="radio" name="plan" value="enterprise" ngModel />
          <span>Enterprise</span>
        </tui-check-field>
      </div>
    `,
  }),
};
