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
      // Map @thalesrc/hermes imports to the source files
      '@thalesrc/hermes/worker': resolve(__dirname, '../../src/worker'),
      '@thalesrc/hermes': resolve(__dirname, '../../src'),
      '@thalesrc/js-utils': resolve(__dirname, '../../../js-utils/src'),
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
