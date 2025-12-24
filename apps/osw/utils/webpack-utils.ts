import { Configuration } from "webpack";

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
	}) as { options: Record<string, any> } | undefined;

	if (miniCssPlugin) {
		miniCssPlugin.options = {
			...miniCssPlugin.options,
			...options,
		};
	}
}