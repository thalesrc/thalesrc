import type { Preview } from '@storybook/web-components';
import '@thalesrc/paintlet';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#f5f5f5',
        },
        {
          name: 'dark',
          value: '#333333',
        },
        {
          name: 'white',
          value: '#ffffff',
        },
      ],
    },
  },
};

export default preview;
