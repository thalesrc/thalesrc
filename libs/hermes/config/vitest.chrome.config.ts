/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../node_modules/.vite/libs/hermes-chrome',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    // Browser mode configuration for Chrome Extension APIs
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: process.env.HEADLESS !== 'false',
      providerOptions: {
        launch: {
          // Chrome extension testing may need additional flags
          args: ['--disable-extensions-except=./test-extension', '--load-extension=./test-extension'],
        },
      },
    },
    // Only run chrome-specific tests
    include: ['src/**/*.chrome.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./config/setup-chrome-test.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/hermes/chrome',
      provider: 'v8' as const,
      include: ['src/chrome/**/*.ts'],
      exclude: [
        '**/*/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
}));
