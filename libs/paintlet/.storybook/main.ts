import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {
      builder: {
        viteConfigPath: 'libs/paintlet/vite.config.storybook.ts',
      },
    },
  },
  docs: {
    autodocs: true,
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
