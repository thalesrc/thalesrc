import { defineConfig, mergeConfig } from 'vite';
import type { UserConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import baseConfig from './vite.config';

// https://vitejs.dev/config/
export default defineConfig(async (env) => {
  const base = await (typeof baseConfig === 'function' ? (baseConfig as any)(env) : baseConfig);

  return mergeConfig(base, {
    plugins: [
      nxViteTsPaths({debug: true, buildLibsFromSource: true}),
    ],
  } as UserConfig);
});
