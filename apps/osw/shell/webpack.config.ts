import { composePlugins, withNx, withWeb } from '@nx/webpack';
import { withModuleFederation } from '@nx/module-federation/webpack';
import * as Dotenv from 'dotenv-webpack';
import { configureWarnings, overrideTsCompilerOptions } from '../utils/webpack-utils';

const config = composePlugins(
  withNx({}),
  withWeb(),
  withModuleFederation({
    name: 'osw/shell',
    // Remote modules are loaded dynamically at runtime. Checkout /src/assets/module-federation-manifest.json
    remotes: []
  }, {
    dts: false,
    library: { type: 'module' }
  }),
  (config, ctx) => {
    // Ignore source map warnings from 3rd party libraries
    configureWarnings(config);

    // Override TypeScript compiler options for modern JavaScript output
    overrideTsCompilerOptions(config);

    config.plugins.push(
      new Dotenv({
        path: 'apps/osw/shell/.env',
        prefix: 'import.meta.env.'
      })
    )

    return config;
  });

export default config;
