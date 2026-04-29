import { resolve } from 'node:path';

import {
  rollup,
  type InputOptions,
  type OutputOptions,
  type Plugin,
  type RollupBuild,
} from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replacePlugin from '@rollup/plugin-replace';
import aliasPlugin from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';

import { programEmitTs } from '../utils/program-emit-ts-plugin';

import type { AliasEntry } from '../utils/tsconfig-paths-aliases';
import { loadEsmOnly } from '../utils/esm-plugin-loader';
import { buildExternalFn } from '../utils/resolve-externals';

import type { IifeFormatOptions, UmdFormatOptions } from './schema';

/**
 * Subset of the resolved executor options needed by the format builder.
 * Decoupling avoids a circular import with `executor.ts`.
 */
export interface BuildContext {
  tsConfigPath: string;
  outputPath: string;
  entryMap: Record<string, string>;
  primaryEntryName: string;
  name: string;
  sourcemap: boolean | 'inline' | 'hidden';
  treeshake: boolean;
  minify: { esm: boolean; cjs: boolean; iife: boolean; umd: boolean };
  replace: Record<string, string>;
  tsconfigPaths: boolean;
  projectRoot: string;
  workspaceRoot: string;
}

export type FormatTaskKind =
  | 'esm-per-file'
  | 'esm-flat'
  | 'cjs-per-file'
  | 'cjs-flat'
  | 'iife'
  | 'umd'
  | 'dts'
  | 'dcts';

export interface FormatTask {
  kind: FormatTaskKind;
  label: string;
  /**
   * Resolved IIFE bundle spec. Present only when `kind === 'iife'`. Each task
   * targets a single entry; multi-entry IIFE configurations expand into
   * multiple tasks during {@link planFormatTasks}.
   */
  iife?: ResolvedBundleSpec;
  /** Resolved UMD bundle spec. Same semantics as `iife`. */
  umd?: ResolvedBundleSpec;
}

/**
 * Fully-resolved per-bundle config used by the IIFE/UMD `buildConfig` arms.
 * The planner pre-resolves these so the builder doesn't have to know about
 * `entries` maps, derived global names, or root-vs-per-entry fallback rules.
 */
export interface ResolvedBundleSpec {
  /** Entry name (key in `BuildContext.entryMap`). */
  entryName: string;
  /** Global variable name (may be dotted, e.g. `TelperionElements.Icon`). */
  name: string;
  /** Output filename without extension, relative to `<outputPath>/<format>/`. */
  fileName: string;
  /** Whether to minify this bundle. */
  minify: boolean;
  /** Externals -> global variable names. */
  globals: Record<string, string>;
}

export interface FormatBuildResult {
  task: FormatTask;
  /** Absolute paths of every emitted chunk and asset. */
  files: string[];
  /** Map from entry name → absolute output path (entry chunks only). */
  entries: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Plugin pipeline
// ---------------------------------------------------------------------------

type RollupBundlerFormat = 'esm' | 'cjs' | 'iife' | 'umd';

export function buildPlugins(
  ctx: BuildContext,
  format: RollupBundlerFormat,
  aliases: AliasEntry[],
): Plugin[] {
  const plugins: Plugin[] = [];
  if (ctx.tsconfigPaths && aliases.length > 0) {
    plugins.push(aliasPlugin({ entries: aliases }));
  }
  if (Object.keys(ctx.replace).length > 0) {
    plugins.push(replacePlugin({ preventAssignment: true, values: ctx.replace }));
  }
  plugins.push(
    nodeResolve({
      preferBuiltins: true,
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.cjs', '.json'],
      browser: format === 'iife' || format === 'umd',
    }),
  );
  plugins.push(commonjs());
  plugins.push(json());
  plugins.push(
    programEmitTs({
      tsConfigPath: ctx.tsConfigPath,
      sourceMap: ctx.sourcemap !== false,
    }),
  );
  if (ctx.minify[format]) {
    plugins.push(terser());
  }
  return plugins;
}

type DtsPlugin = (opts?: { tsconfig?: string; respectExternal?: boolean }) => Plugin;

async function loadDtsPlugin(): Promise<DtsPlugin> {
  return loadEsmOnly<DtsPlugin>(
    'rollup-plugin-dts',
    (mod) => (mod.dts ?? (mod as { default?: DtsPlugin }).default) as DtsPlugin,
  );
}

// ---------------------------------------------------------------------------
// Rollup runner
// ---------------------------------------------------------------------------

/**
 * Run a single Rollup build. Suppresses noisy warnings that are inherent to
 * per-file ESM emission and returns the absolute paths of every emitted file
 * along with a mapping from entry name to its output path.
 */
async function runOnce(
  inputOptions: InputOptions,
  outputs: OutputOptions[],
): Promise<{ files: string[]; entries: Record<string, string> }> {
  let bundle: RollupBuild | undefined;
  const files: string[] = [];
  const entries: Record<string, string> = {};
  try {
    bundle = await rollup({
      ...inputOptions,
      onwarn(warning, defaultHandler) {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        defaultHandler(warning);
      },
    });
    for (const out of outputs) {
      const result = await bundle.write(out);
      const baseDir = out.dir
        ? resolve(out.dir)
        : out.file
          ? resolve(out.file, '..')
          : '';
      for (const item of result.output) {
        const abs = resolve(baseDir, item.fileName);
        files.push(abs);
        if (item.type === 'chunk' && item.isEntry) {
          entries[item.name] = abs;
        }
      }
    }
  } finally {
    await bundle?.close();
  }
  return { files, entries };
}

// ---------------------------------------------------------------------------
// Per-kind config builders
// ---------------------------------------------------------------------------

function entriesAsInput(ctx: BuildContext): Record<string, string> {
  const input: Record<string, string> = {};
  for (const [name, file] of Object.entries(ctx.entryMap)) {
    input[name] = resolve(ctx.workspaceRoot, ctx.projectRoot, file);
  }
  return input;
}

function primaryInput(ctx: BuildContext): string {
  return resolve(ctx.workspaceRoot, ctx.projectRoot, ctx.entryMap[ctx.primaryEntryName]);
}

function entryInput(ctx: BuildContext, entryName: string): string {
  const file = ctx.entryMap[entryName];
  if (!file) {
    throw new Error(
      `[ts-builder-v2] iife/umd entry '${entryName}' not found in entry map. Known entries: ${Object.keys(ctx.entryMap).join(', ')}`,
    );
  }
  return resolve(ctx.workspaceRoot, ctx.projectRoot, file);
}

/**
 * Convert an entry name like `drag-drop/index` or `icon` into a PascalCase
 * suffix usable in a JS identifier (`DragDrop`, `Icon`). Strips a trailing
 * `/index` segment and PascalCases each remaining `kebab-` or `snake_` word.
 */
export function deriveNestedGlobal(rootName: string, entryName: string): string {
  const stripped = entryName.replace(/\/index$/i, '');
  const segments = stripped.split('/').filter(Boolean);
  const pascal = segments
    .map((seg) =>
      seg
        .split(/[-_]/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(''),
    )
    .join('');
  return pascal ? `${rootName}.${pascal}` : rootName;
}

function preserveModulesRoot(ctx: BuildContext): string {
  return resolve(ctx.workspaceRoot, ctx.projectRoot, 'src');
}

interface BuiltConfig {
  inputOptions: InputOptions;
  outputs: OutputOptions[];
}

async function buildConfig(
  ctx: BuildContext,
  task: FormatTask,
  externalIds: string[],
  aliases: AliasEntry[],
): Promise<BuiltConfig> {
  switch (task.kind) {
    case 'esm-per-file':
      return {
        inputOptions: {
          input: entriesAsInput(ctx),
          external: buildExternalFn(externalIds),
          treeshake: ctx.treeshake,
          plugins: buildPlugins(ctx, 'esm', aliases),
        },
        outputs: [
          {
            dir: ctx.outputPath,
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: preserveModulesRoot(ctx),
            entryFileNames: '[name].js',
            chunkFileNames: '_chunks/[name]-[hash].js',
            sourcemap: ctx.sourcemap,
            exports: 'auto',
          },
        ],
      };

    case 'cjs-per-file':
      return {
        inputOptions: {
          input: entriesAsInput(ctx),
          external: buildExternalFn(externalIds),
          treeshake: ctx.treeshake,
          plugins: buildPlugins(ctx, 'cjs', aliases),
        },
        outputs: [
          {
            dir: ctx.outputPath,
            format: 'cjs',
            preserveModules: true,
            preserveModulesRoot: preserveModulesRoot(ctx),
            entryFileNames: '[name].cjs',
            chunkFileNames: '_chunks/[name]-[hash].cjs',
            sourcemap: ctx.sourcemap,
            exports: 'auto',
          },
        ],
      };

    case 'esm-flat':
      return {
        inputOptions: {
          input: primaryInput(ctx),
          external: buildExternalFn(externalIds),
          treeshake: ctx.treeshake,
          plugins: buildPlugins(ctx, 'esm', aliases),
        },
        outputs: [
          {
            file: resolve(ctx.outputPath, 'fesm', `${ctx.name}.mjs`),
            format: 'es',
            sourcemap: ctx.sourcemap,
            exports: 'auto',
          },
        ],
      };

    case 'cjs-flat':
      return {
        inputOptions: {
          input: primaryInput(ctx),
          external: buildExternalFn(externalIds),
          treeshake: ctx.treeshake,
          plugins: buildPlugins(ctx, 'cjs', aliases),
        },
        outputs: [
          {
            file: resolve(ctx.outputPath, `${ctx.name}.cjs`),
            format: 'cjs',
            sourcemap: ctx.sourcemap,
            exports: 'auto',
          },
        ],
      };

    case 'iife': {
      const spec = task.iife as ResolvedBundleSpec;
      const externals = Object.keys(spec.globals);
      return {
        inputOptions: {
          input: entryInput(ctx, spec.entryName),
          external: buildExternalFn(externals),
          treeshake: ctx.treeshake,
          plugins: buildPlugins({ ...ctx, minify: { ...ctx.minify, iife: spec.minify } }, 'iife', aliases),
        },
        outputs: [
          {
            file: resolve(ctx.outputPath, 'iife', `${spec.fileName}.js`),
            format: 'iife',
            name: spec.name,
            extend: spec.name.includes('.'),
            globals: spec.globals,
            sourcemap: ctx.sourcemap,
            exports: 'auto',
            inlineDynamicImports: true,
          },
        ],
      };
    }

    case 'umd': {
      const spec = task.umd as ResolvedBundleSpec;
      const externals = Object.keys(spec.globals);
      return {
        inputOptions: {
          input: entryInput(ctx, spec.entryName),
          external: buildExternalFn(externals),
          treeshake: ctx.treeshake,
          plugins: buildPlugins({ ...ctx, minify: { ...ctx.minify, umd: spec.minify } }, 'umd', aliases),
        },
        outputs: [
          {
            file: resolve(ctx.outputPath, 'umd', `${spec.fileName}.js`),
            format: 'umd',
            name: spec.name,
            extend: spec.name.includes('.'),
            globals: spec.globals,
            sourcemap: ctx.sourcemap,
            exports: 'auto',
            inlineDynamicImports: true,
          },
        ],
      };
    }

    case 'dts':
    case 'dcts': {
      const ext = task.kind === 'dts' ? 'd.ts' : 'd.cts';
      const plugins: Plugin[] = [];
      if (ctx.tsconfigPaths && aliases.length > 0) {
        plugins.push(aliasPlugin({ entries: aliases }));
      }
      const dts = await loadDtsPlugin();
      plugins.push(dts({ tsconfig: ctx.tsConfigPath, respectExternal: true }));
      return {
        inputOptions: {
          input: entriesAsInput(ctx),
          external: buildExternalFn(externalIds),
          plugins,
        },
        outputs: [
          {
            dir: ctx.outputPath,
            format: 'es',
            entryFileNames: `[name].${ext}`,
            chunkFileNames: `_chunks/[name]-[hash].${ext}`,
          },
        ],
      };
    }
  }
}

/**
 * Run a single format task and return the emitted files. Replaces the six
 * near-identical `buildXxx` functions in the previous executor.
 */
export async function runFormatBuild(
  ctx: BuildContext,
  task: FormatTask,
  externalIds: string[],
  aliases: AliasEntry[],
): Promise<FormatBuildResult> {
  const { inputOptions, outputs } = await buildConfig(ctx, task, externalIds, aliases);
  const { files, entries } = await runOnce(inputOptions, outputs);
  // For iife/umd, Rollup labels the entry by its source basename (e.g.
  // `index`), which collides across multiple per-entry bundles. Re-key the
  // result to the planner-resolved entry name so the manifest aggregator
  // attaches each output to the right manifest entry.
  if ((task.kind === 'iife' && task.iife) || (task.kind === 'umd' && task.umd)) {
    const spec = (task.iife ?? task.umd) as ResolvedBundleSpec;
    const file = files[0];
    return { task, files, entries: file ? { [spec.entryName]: file } : {} };
  }
  return { task, files, entries };
}

/**
 * Expand a `formats.iife` (or `formats.umd`) configuration into one resolved
 * bundle spec per emitted bundle. The root bundle is included only when the
 * top-level `name` is set; per-entry bundles fall back to a derived nested
 * name (`<RootName>.<PascalEntry>`) when omitted.
 */
function expandBundleSpecs(
  format: IifeFormatOptions | UmdFormatOptions,
  ctx: { libName: string; primaryEntryName: string; defaultMinify: boolean },
): ResolvedBundleSpec[] {
  const out: ResolvedBundleSpec[] = [];
  const rootName = format.name;
  const rootMinify = format.minify ?? ctx.defaultMinify;
  const rootGlobals = format.globals ?? {};

  if (rootName) {
    out.push({
      entryName: ctx.primaryEntryName,
      name: rootName,
      fileName: format.fileName ?? ctx.libName,
      minify: rootMinify,
      globals: rootGlobals,
    });
  }

  for (const [entryName, perEntry] of Object.entries(format.entries ?? {})) {
    if (entryName === ctx.primaryEntryName && rootName) continue; // already emitted as root
    const derivedName = perEntry.name
      ?? (rootName ? deriveNestedGlobal(rootName, entryName) : undefined);
    if (!derivedName) {
      throw new Error(
        `[ts-builder-v2] iife/umd entry '${entryName}' has no name. Set either the top-level 'name' or 'entries.${entryName}.name'.`,
      );
    }
    out.push({
      entryName,
      name: derivedName,
      fileName: perEntry.fileName ?? entryName,
      minify: perEntry.minify ?? rootMinify,
      globals: perEntry.globals ?? rootGlobals,
    });
  }

  // Detect colliding output paths (root vs an entry override).
  const seen = new Map<string, string>();
  for (const spec of out) {
    const prev = seen.get(spec.fileName);
    if (prev) {
      throw new Error(
        `[ts-builder-v2] iife/umd file name collision: entries '${prev}' and '${spec.entryName}' both resolve to '${spec.fileName}.js'`,
      );
    }
    seen.set(spec.fileName, spec.entryName);
  }

  return out;
}

/**
 * Enumerate the format tasks selected by a fully-resolved set of options.
 * Order matches the sequence used by the legacy executor so logs and outputs
 * are bit-for-bit reproducible. Multi-entry IIFE/UMD configurations expand
 * into one task per emitted bundle.
 */
export function planFormatTasks(
  formats: {
    esm: { perFile: boolean; flat: boolean };
    cjs: { perFile: boolean; flat: boolean };
    iife: IifeFormatOptions | null;
    umd: UmdFormatOptions | null;
    types: { dts: boolean; dcts: boolean };
  },
  ctx: { libName: string; primaryEntryName: string; defaultMinify: { iife: boolean; umd: boolean } },
): FormatTask[] {
  const tasks: FormatTask[] = [];
  if (formats.esm.perFile) tasks.push({ kind: 'esm-per-file', label: 'esm (per-file)' });
  if (formats.esm.flat) tasks.push({ kind: 'esm-flat', label: 'esm (flat)' });
  if (formats.cjs.perFile) tasks.push({ kind: 'cjs-per-file', label: 'cjs (per-file)' });
  if (formats.cjs.flat) tasks.push({ kind: 'cjs-flat', label: 'cjs (flat)' });
  if (formats.iife) {
    const specs = expandBundleSpecs(formats.iife, {
      libName: ctx.libName,
      primaryEntryName: ctx.primaryEntryName,
      defaultMinify: ctx.defaultMinify.iife,
    });
    for (const spec of specs) {
      tasks.push({ kind: 'iife', label: `iife (${spec.entryName})`, iife: spec });
    }
  }
  if (formats.umd) {
    const specs = expandBundleSpecs(formats.umd, {
      libName: ctx.libName,
      primaryEntryName: ctx.primaryEntryName,
      defaultMinify: ctx.defaultMinify.umd,
    });
    for (const spec of specs) {
      tasks.push({ kind: 'umd', label: `umd (${spec.entryName})`, umd: spec });
    }
  }
  if (formats.types.dts) tasks.push({ kind: 'dts', label: 'd.ts' });
  if (formats.types.dcts) tasks.push({ kind: 'dcts', label: 'd.cts' });
  return tasks;
}
