/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../../node_modules/.vite/libs/messenger-chrome',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: process.env.HEADLESS !== 'false',
      providerOptions: {
        launch: {
          args: ['--disable-extensions-except=./test-extension', '--load-extension=./test-extension'],
        },
      },
    },
    include: ['src/chrome/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      clean: true,
      reportsDirectory: path.join(__dirname, '../../../coverage/libs/messenger/chrome'),
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/chrome/**/*.ts'],
      exclude: [
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
}));
