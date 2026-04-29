export type ExportCondition = 'types' | 'node' | 'import' | 'require' | 'default' | 'browser';

export interface PopulateExportsTemplates {
  /** Template for the `types` condition. Default: `<path>.d.ts`. */
  types?: string;
  /** Template for the `types` condition under `require`. Default: `<path>.d.cts`. */
  typesRequire?: string;
  /** Template for the `node` condition. Default: `<path>.cjs`. */
  node?: string;
  /** Template for the `import` condition. Default: `<path>.js`. */
  import?: string;
  /** Template for the `require` condition. Default: `<path>.cjs`. */
  require?: string;
  /** Template for the `default` condition. Default: `<path>.js` (resolves to ESM). */
  default?: string;
  /** Template for the `browser` condition. Default: `<path>.js`. */
  browser?: string;
}

export interface PopulateExportsOptions {
  /**
   * Where to source the entry list and output paths from.
   *
   * - `'manifest'`: read `.build-manifest.json` written by `ts-builder-v2` and
   *   derive the exports map directly from emitted output paths. `templates`,
   *   `entriesTemplateProperty`, and `dcts` overrides are ignored — the
   *   manifest already records exactly which formats were emitted.
   * - `'exports'`: legacy/manual flow. Read `entries` (or `entriesTemplateProperty`)
   *   and apply `templates` to derive each path.
   * - `'auto'` (default): use `'manifest'` when the manifest file exists, fall
   *   back to `'exports'` otherwise.
   */
  source?: 'manifest' | 'exports' | 'auto';

  /**
   * File name of the build manifest (relative to outputPath). Default
   * `'.build-manifest.json'`. Only consulted when `source` resolves to
   * `'manifest'`.
   */
  manifestFile?: string;

  /**
   * Conditional export keys to emit. The executor reorders to spec order
   * (`types` first, `default` last) regardless of input.
   *
   * @default ['types', 'node', 'import', 'require', 'default']
   */
  exports?: ExportCondition[];

  /**
   * Subpath entries to emit (in addition to `.`). Trailing slash means a barrel directory.
   * If omitted, falls back to reading `entriesTemplateProperty` from the project's package.json.
   */
  entries?: string[];

  /**
   * Property name in the project's package.json to read entries from when `entries`
   * isn't provided. The property is removed from the final output.
   *
   * @default '_exports'
   */
  entriesTemplateProperty?: string;

  /** @default 'index' */
  barrelFileName?: string;

  /**
   * Use the FESM flat ESM bundle for `import`/`default` conditions instead of the
   * per-file ESM build. Only valid for a single root entry.
   *
   * @default false
   */
  useFesm?: boolean;

  /** Emit `.d.cts` types entry alongside `.d.ts` for the `require` condition. */
  dcts?: boolean;

  templates?: PopulateExportsTemplates;
}

export interface FillPackageJsonV2ExecutorSchema {
  /** Directory where the package.json will be written (relative to workspace root). */
  outputPath: string;

  /** Package version. Overrides the value in the project package.json. */
  packageVersion?: string;

  /**
   * Value for the `sideEffects` field. If omitted, the project package.json's value
   * is used; if missing there, defaults to `false`.
   */
  sideEffects?: boolean | string[];

  /** Auto-synthesize top-level `main` / `module` / `types` from the `.` export. */
  topLevelFields?: boolean;

  /**
   * CDN script-tag entry. Set to a path string (relative to outputPath) to populate
   * `unpkg` and `jsdelivr` fields, or pass an object for fine-grained control.
   */
  cdn?: string | { unpkg?: string; jsdelivr?: string; browser?: string };

  /**
   * Controls how the `exports` map is populated.
   * - `'auto'` (or `{}` / omitted): use the build manifest if present, else fall
   *   back to template-based generation from `_exports`.
   * - `'skip'` (or `false`): leave the existing `exports` field untouched.
   * - object: explicit configuration; see {@link PopulateExportsOptions}.
   */
  populateExports?: 'auto' | 'skip' | false | PopulateExportsOptions;
}
