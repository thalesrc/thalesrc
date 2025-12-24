import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack';
import { configureExtensions, configureWarnings, overrideMiniCssPluginOptions } from '../utils/webpack-utils';

export default composePlugins(
  withNx({extractCss: false}),
  withReact({generateIndexHtml: false}),
  withModuleFederation({
    name: 'osw/home',
    exposes: {
      './Home': './src/Home/index.tsx',
    },
  }, {
    dts: false,
    library: { type: 'module' }
  }),
  (config, ctx) => {
    // Ignore source map warnings from 3rd party libraries
    configureWarnings(config);

    // Resolve react and typescript extensions
    configureExtensions(config, ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss']);

    // Disable emitting CSS files for Module Federation builds
    // as CSS is injected via JS at runtime
    overrideMiniCssPluginOptions(config, {runtime: false});

    // Enable output as module
    (config.experiments ??= {}).outputModule = true;

    return config;
  }
);
