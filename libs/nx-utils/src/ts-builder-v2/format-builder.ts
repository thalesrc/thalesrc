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
  /** Format-specific options (iife/umd carry name/globals/etc). */
  iife?: IifeFormatOptions;
  umd?: UmdFormatOptions;
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
      const iife = task.iife as IifeFormatOptions;
      const externals = Object.keys(iife.globals ?? {});
      const fileBase = iife.fileName ?? ctx.name;
      const minify = iife.minify ?? ctx.minify.iife;
      return {
        inputOptions: {
          input: primaryInput(ctx),
          external: buildExternalFn(externals),
          treeshake: ctx.treeshake,
          plugins: buildPlugins({ ...ctx, minify: { ...ctx.minify, iife: minify } }, 'iife', aliases),
        },
        outputs: [
          {
            file: resolve(ctx.outputPath, 'iife', `${fileBase}.js`),
            format: 'iife',
            name: iife.name,
            globals: iife.globals,
            sourcemap: ctx.sourcemap,
            exports: 'auto',
            inlineDynamicImports: true,
          },
        ],
      };
    }

    case 'umd': {
      const umd = task.umd as UmdFormatOptions;
      const externals = Object.keys(umd.globals ?? {});
      const fileBase = umd.fileName ?? ctx.name;
      const minify = umd.minify ?? ctx.minify.umd;
      return {
        inputOptions: {
          input: primaryInput(ctx),
          external: buildExternalFn(externals),
          treeshake: ctx.treeshake,
          plugins: buildPlugins({ ...ctx, minify: { ...ctx.minify, umd: minify } }, 'umd', aliases),
        },
        outputs: [
          {
            file: resolve(ctx.outputPath, 'umd', `${fileBase}.js`),
            format: 'umd',
            name: umd.name,
            globals: umd.globals,
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
  return { task, files, entries };
}

/**
 * Enumerate the format tasks selected by a fully-resolved set of options.
 * Order matches the sequence used by the legacy executor so logs and outputs
 * are bit-for-bit reproducible.
 */
export function planFormatTasks(formats: {
  esm: { perFile: boolean; flat: boolean };
  cjs: { perFile: boolean; flat: boolean };
  iife: IifeFormatOptions | null;
  umd: UmdFormatOptions | null;
  types: { dts: boolean; dcts: boolean };
}): FormatTask[] {
  const tasks: FormatTask[] = [];
  if (formats.esm.perFile) tasks.push({ kind: 'esm-per-file', label: 'esm (per-file)' });
  if (formats.esm.flat) tasks.push({ kind: 'esm-flat', label: 'esm (flat)' });
  if (formats.cjs.perFile) tasks.push({ kind: 'cjs-per-file', label: 'cjs (per-file)' });
  if (formats.cjs.flat) tasks.push({ kind: 'cjs-flat', label: 'cjs (flat)' });
  if (formats.iife) tasks.push({ kind: 'iife', label: 'iife', iife: formats.iife });
  if (formats.umd) tasks.push({ kind: 'umd', label: 'umd', umd: formats.umd });
  if (formats.types.dts) tasks.push({ kind: 'dts', label: 'd.ts' });
  if (formats.types.dcts) tasks.push({ kind: 'dcts', label: 'd.cts' });
  return tasks;
}
