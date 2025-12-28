import { Configuration, WebpackPluginInstance } from "webpack";

export function configureExtensions(config: Configuration, extensions: string[]): void {
  config.resolve!.extensions = [...new Set([...(config.resolve!.extensions ?? []), ...extensions])];
}

export function configureWarnings(config: Configuration): void {
  // Ignore source map warnings from 3rd party libraries
  (config.ignoreWarnings ??= []).push(
    {
      module: /node_modules/,
      message: /Failed to parse source map/,
    },
    {
      module: /node_modules/,
      message: /charset must precede all other statements/,
    }
  );
}

export function overrideMiniCssPluginOptions(config: Configuration, options: Record<string, any>): void {
  const miniCssPlugin = config.plugins?.find((plugin) => {
    return (plugin as any).constructor.name === 'MiniCssExtractPlugin';
  }) as WebpackPluginInstance;

  if (miniCssPlugin) {
    miniCssPlugin.options = {
      ...miniCssPlugin.options,
      ...options,
    };
  }
}

export function overrideTsCompilerOptions(config: Configuration): void {
  // Set webpack target to preserve modern JavaScript
  config.target = 'es2022';

  // Configure webpack output for ES modules
  config.output = {
    ...config.output,
    module: true,
    environment: {
      arrowFunction: true,
      const: true,
      destructuring: true,
      forOf: true,
      module: true,
    }
  };

  config.experiments = {
    ...config.experiments,
    outputModule: true,
  };

  // Find and reconfigure SWC loader to preserve ES2022
  if (config.module?.rules) {
    config.module.rules.forEach((rule: any) => {
      if (rule && typeof rule === 'object' && rule.test?.test('foo.ts')) {
        if (rule.loader?.includes('swc-loader')) {
          // Configure SWC to target ES2022 and preserve class syntax
          rule.options = {
            ...rule.options,
            jsc: {
              ...rule.options?.jsc,
              target: 'esnext',
              loose: false, // Strict mode to preserve class behavior
              transform: {
                ...rule.options?.jsc?.transform,
                useDefineForClassFields: false, // Critical for LitElement
              },
              externalHelpers: false,
              keepClassNames: true, // Preserve class names
            }
          };
        }
      }
    });
  }
}
