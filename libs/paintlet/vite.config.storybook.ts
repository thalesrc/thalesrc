import * as path from 'path';
import { defineConfig, mergeConfig } from 'vite';
import type { UserConfig } from 'vite';
import baseConfig from './vite.config';

// https://vitejs.dev/config/
export default defineConfig(async (env) => {
  const base = await (typeof baseConfig === 'function' ? (baseConfig as any)(env) : baseConfig);

  return mergeConfig(base, {
    resolve: {
      alias: {},
    },
  } as UserConfig);
});
