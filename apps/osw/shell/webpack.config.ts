import { composePlugins, withNx, withWeb } from '@nx/webpack';
import { withModuleFederation } from '@nx/module-federation/webpack';
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

    return config;
  });

export default config;
