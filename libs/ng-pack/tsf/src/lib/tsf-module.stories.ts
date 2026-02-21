import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TsfModule } from './tsf-module';
import { JsonPipe } from '@angular/common';

const meta: Meta<typeof TsfModule> = {
  title: 'NgPack/TSF Module',
  decorators: [
    moduleMetadata({
      imports: [TsfModule, JsonPipe],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TsfModule>;

export const ModuleImported: Story = {
  render: () => ({
    template: `
      <div>
        <h3>TSF Module Example</h3>
        <p>The TsfModule from @telperion/ng-pack/tsf is successfully imported.</p>
        <p>You can add your own components to this module and showcase them here.</p>
      </div>
      <form tsfForm #form="tsfForm">
        <label for="firstname">First Name:</label>
        <input id="firstname" name="firstname" type="text" tsfField #firstname="tsfField" />
        <button type="submit">Submit</button>
      </form>

      <button (click)="firstname.setValue('John')">Set First Name to John</button>

      <pre>{{ form.form().value() | json }}</pre>
    `,
  }),
};

export const WithCustomContent: Story = {
  render: () => ({
    template: `
      <div style="padding: 20px; border: 2px solid #4CAF50; border-radius: 8px;">
        <h3 style="color: #4CAF50;">TSF Module Demo</h3>
        <p>This is a secondary entry point: <code>@telperion/ng-pack/tsf</code></p>
        <ul>
          <li>Supports modular architecture</li>
          <li>Separate bundle from main library</li>
          <li>Tree-shakeable imports</li>
        </ul>
      </div>
    `,
  }),
};
