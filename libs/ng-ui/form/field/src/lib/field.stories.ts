import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { FieldModule } from './field.module';
import { FieldComponent } from './field.component';

const meta: Meta<FieldComponent> = {
  title: 'Form/Field',
  component: FieldComponent,
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
    label: 'First name',
    hint: '',
  },
};

export default meta;
type Story = StoryObj<FieldComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tui-field [label]="label" [hint]="hint">
        <input type="text" name="firstName" ngModel placeholder="John" />
      </tui-field>
    `,
  }),
};

export const WithHint: Story = {
  args: {
    label: 'Username',
    hint: 'Letters, numbers and underscores only.',
  },
  render: (args) => ({
    props: args,
    template: `
      <tui-field [label]="label" [hint]="hint">
        <input type="text" name="username" ngModel />
      </tui-field>
    `,
  }),
};

export const Required: Story = {
  args: {
    label: 'Email',
    hint: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <tui-field [label]="label" [hint]="hint">
        <input type="email" name="email" ngModel required />
      </tui-field>
    `,
  }),
};

export const EmailValidation: Story = {
  args: {
    label: 'Email',
    hint: 'We will never share your email.',
  },
  render: (args) => ({
    props: args,
    template: `
      <tui-field [label]="label" [hint]="hint">
        <input type="email" name="email" ngModel required email />
      </tui-field>
    `,
  }),
};

export const MinLength: Story = {
  args: {
    label: 'Password',
    hint: 'At least 8 characters.',
  },
  render: (args) => ({
    props: args,
    template: `
      <tui-field [label]="label" [hint]="hint">
        <input type="password" name="password" ngModel required minlength="8" />
      </tui-field>
    `,
  }),
};

export const Textarea: Story = {
  args: {
    label: 'Bio',
    hint: 'Tell us about yourself.',
  },
  render: (args) => ({
    props: args,
    template: `
      <tui-field [label]="label" [hint]="hint">
        <textarea name="bio" ngModel rows="3"></textarea>
      </tui-field>
    `,
  }),
};

export const MultipleFields: Story = {
  render: () => ({
    template: `
      <form #form="ngForm" class="flex flex-col gap-4 max-w-sm">
        <tui-field label="First name">
          <input type="text" name="firstName" ngModel required />
        </tui-field>
        <tui-field label="Last name">
          <input type="text" name="lastName" ngModel required />
        </tui-field>
        <tui-field label="Email" hint="We will never share your email.">
          <input type="email" name="email" ngModel required email />
        </tui-field>
        <tui-field label="Password" hint="At least 8 characters.">
          <input type="password" name="password" ngModel required minlength="8" />
        </tui-field>
      </form>
    `,
  }),
};
