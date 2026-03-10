import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(__dirname),
  server: {
    port: 5173,
    open: true,
    fs: {
      // Allow serving files from the workspace root
      allow: [resolve(__dirname, '../../../../')],
    },
  },
  resolve: {
    alias: {
      // Map @telperion/messenger imports to the source files (new package name)
      '@telperion/messenger/worker': resolve(__dirname, '../../src/worker'),
      '@telperion/messenger': resolve(__dirname, '../../src'),
      // Backward compatibility - map old @thalesrc/hermes imports to messenger source
      '@thalesrc/hermes/worker': resolve(__dirname, '../../src/worker'),
      '@thalesrc/hermes': resolve(__dirname, '../../src'),
      '@telperion/js-utils': resolve(__dirname, '../../../js-utils/src'),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    outDir: resolve(__dirname, '../../dist/demo/worker'),
    emptyOutDir: true,
  },
});
