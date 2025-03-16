import { PlatformRunnerExecutorSchema } from "./schema";

export function platformScriptReplacer(options: PlatformRunnerExecutorSchema): string {
  const { script, default: defaultOptions, ...platformOptions } = options;
  const platform = process.platform;
  const aliases = {
    ...defaultOptions,
    ...(platformOptions[platform] || {}),
  };

  return Object.entries(aliases).reduce(
    (acc, [key, value]) => acc.replace(`<<${key}>>`, value.toString()),
    script
  );
}
