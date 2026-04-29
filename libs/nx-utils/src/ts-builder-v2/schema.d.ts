export type EsmFormatOptions = boolean | { perFile?: boolean; flat?: boolean };
export type CjsFormatOptions = boolean | { perFile?: boolean; flat?: boolean };

export interface IifeFormatOptions {
  /** Global variable name to expose. */
  name: string;
  /** Output filename without extension. Defaults to the library name. */
  fileName?: string;
  /** Minify the bundle. Defaults to true. */
  minify?: boolean;
  /** Map external module name -> global variable name. */
  globals?: Record<string, string>;
}

export interface UmdFormatOptions {
  name: string;
  fileName?: string;
  minify?: boolean;
  globals?: Record<string, string>;
}

export type TypesFormatOptions = boolean | { dts?: boolean; dcts?: boolean };

export interface FormatsOptions {
  esm?: EsmFormatOptions;
  cjs?: CjsFormatOptions;
  iife?: false | IifeFormatOptions;
  umd?: false | UmdFormatOptions;
  types?: TypesFormatOptions;
}

export interface MinifyOptions {
  esm?: boolean;
  cjs?: boolean;
  iife?: boolean;
  umd?: boolean;
}

export interface TsBuilderV2ExecutorSchema {
  /**
   * Path to the tsconfig file. Relative to project root if it starts with `./` or `../`,
   * otherwise resolved against the workspace root.
   *
   * @default 'tsconfig.lib.json'
   */
  tsConfigPath?: string;

  /**
   * Destination directory relative to the workspace root.
   *
   * @default 'dist'
   */
  outputPath?: string;

  /**
   * Library entry point(s).
   *
   * - `'auto'` (default): compile every `.ts` file under the source root (excluding `*.spec.ts` and `*.d.ts`).
   *   Mirrors the behavior of the legacy gulp-based builder and ensures side-effect modules are emitted.
   * - `string`: single entry, output name derived from filename.
   * - `string[]`: multiple entries, output name derived from each filename.
   * - `Record<string, string>`: name -> path map.
   *
   * @default 'auto'
   */
  entry?: 'auto' | string | string[] | Record<string, string>;

  /**
   * Source root used when `entry` is `'auto'`. Relative to the project root.
   *
   * @default 'src'
   */
  sourceRoot?: string;

  /**
   * Logical name for flat bundle filenames (FESM, IIFE, UMD). Defaults to project name.
   */
  name?: string;

  /**
   * Which output formats to produce.
   */
  formats?: FormatsOptions;

  /**
   * Modules treated as external. `'auto'` derives the list from the project's
   * `package.json` (`dependencies` + `peerDependencies` + Node builtins).
   *
   * @default 'auto'
   */
  external?: 'auto' | string[];

  /**
   * Dependencies to force-bundle even when otherwise external. Useful for IIFE/CDN.
   */
  bundleDependencies?: string[];

  /** Source map mode. */
  sourcemap?: boolean | 'inline' | 'hidden';

  /** Enable Rollup tree-shaking. */
  treeshake?: boolean;

  /** Minification settings. */
  minify?: boolean | MinifyOptions;

  /** Remove the output directory before building. */
  clean?: boolean;

  /** Run rollup in watch mode. */
  watch?: boolean;

  /** Compile-time string replacements. */
  replace?: Record<string, string>;

  /** Resolve workspace tsconfig.base.json `paths` aliases. */
  tsconfigPaths?: boolean;

  /**
   * Emit a `.build-manifest.json` file describing every entry and its produced
   * output files. Consumed by `fill-package-json-v2`. `true` writes the default
   * name; a string is used as the file name (relative to `outputPath`).
   */
  outputManifest?: boolean | string;

  /**
   * Maximum number of format builds to run in parallel. Defaults to half the
   * available CPU cores (clamped to 1..6).
   */
  concurrency?: number;
}
