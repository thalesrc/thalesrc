import type { ExecutorContext, PromiseExecutor } from '@nx/devkit';
import { rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { cpus } from 'node:os';

import {
  watch as rollupWatch,
  type InputOptions,
  type RollupOptions,
  type RollupWatcher,
} from 'rollup';

import { autoDiscoverEntries } from '../utils/walk-source-files';
import { loadWorkspaceAliases, type AliasEntry } from '../utils/tsconfig-paths-aliases';
import { buildExternalFn, deriveAutoExternals } from '../utils/resolve-externals';
import { readJson } from '../utils/read-json';
import { formatBuildError, symbols } from '../utils/console';
import { runProjectDiagnostics } from '../utils/ts-program';
import { clearEmitCache } from '../utils/program-emit-ts-plugin';
import { createLimit } from '../utils/p-limit';
import {
  buildManifestObject,
  writeManifest,
  type ManifestFormatKey,
} from '../utils/build-manifest';

import {
  buildPlugins,
  planFormatTasks,
  runFormatBuild,
  type BuildContext,
  type FormatBuildResult,
  type FormatTaskKind,
} from './format-builder';

import type {
  CjsFormatOptions,
  EsmFormatOptions,
  IifeFormatOptions,
  MinifyOptions,
  TsBuilderV2ExecutorSchema,
  TypesFormatOptions,
  UmdFormatOptions,
} from './schema';

interface ResolvedFormats {
  esm: { perFile: boolean; flat: boolean };
  cjs: { perFile: boolean; flat: boolean };
  iife: IifeFormatOptions | null;
  umd: UmdFormatOptions | null;
  types: { dts: boolean; dcts: boolean };
}

interface ResolvedMinify {
  esm: boolean;
  cjs: boolean;
  iife: boolean;
  umd: boolean;
}

interface ResolvedOptions extends BuildContext {
  formats: ResolvedFormats;
  external: string[] | 'auto';
  bundleDependencies: string[];
  clean: boolean;
  watch: boolean;
  outputManifest: boolean | string;
  concurrency: number;
  projectName: string;
}

function resolveEsm(opt: EsmFormatOptions | undefined): { perFile: boolean; flat: boolean } {
  if (opt === false) return { perFile: false, flat: false };
  if (opt === true || opt == null) return { perFile: true, flat: true };
  return { perFile: opt.perFile ?? true, flat: opt.flat ?? true };
}

function resolveCjs(opt: CjsFormatOptions | undefined): { perFile: boolean; flat: boolean } {
  if (opt === false) return { perFile: false, flat: false };
  if (opt === true) return { perFile: true, flat: false };
  if (opt == null) return { perFile: true, flat: false };
  return { perFile: opt.perFile ?? true, flat: opt.flat ?? false };
}

function resolveTypes(opt: TypesFormatOptions | undefined): { dts: boolean; dcts: boolean } {
  if (opt === false) return { dts: false, dcts: false };
  if (opt === true || opt == null) return { dts: true, dcts: true };
  return { dts: opt.dts ?? true, dcts: opt.dcts ?? true };
}

function resolveMinify(opt: TsBuilderV2ExecutorSchema['minify']): ResolvedMinify {
  const defaults: ResolvedMinify = { esm: false, cjs: false, iife: true, umd: false };
  if (opt == null) return defaults;
  if (typeof opt === 'boolean') return { esm: opt, cjs: opt, iife: opt, umd: opt };
  return { ...defaults, ...(opt as MinifyOptions) };
}

function entryNameFromPath(path: string): string {
  const base = path.replace(/\\/g, '/').split('/').pop() ?? path;
  return base.replace(/\.[cm]?[tj]sx?$/, '');
}

async function normalizeEntry(
  entry: TsBuilderV2ExecutorSchema['entry'],
  projectRoot: string,
  workspaceRoot: string,
  sourceRoot: string,
): Promise<Record<string, string>> {
  if (entry == null || entry === 'auto') {
    return await autoDiscoverEntries(projectRoot, workspaceRoot, sourceRoot);
  }
  if (typeof entry === 'string') return { [entryNameFromPath(entry)]: entry };
  if (Array.isArray(entry)) {
    return entry.reduce<Record<string, string>>((acc, p) => {
      acc[entryNameFromPath(p)] = p;
      return acc;
    }, {});
  }
  return { ...entry };
}

function resolveTsConfigAbsolute(tsConfigPath: string, projectRoot: string, workspaceRoot: string): string {
  if (isAbsolute(tsConfigPath)) return tsConfigPath;
  if (tsConfigPath.startsWith('./') || tsConfigPath.startsWith('../')) {
    return resolve(workspaceRoot, projectRoot, tsConfigPath);
  }
  return resolve(workspaceRoot, tsConfigPath);
}

const FORMAT_KIND_TO_MANIFEST_KEY: Record<FormatTaskKind, ManifestFormatKey> = {
  'esm-per-file': 'esm',
  'esm-flat': 'esmFlat',
  'cjs-per-file': 'cjs',
  'cjs-flat': 'cjsFlat',
  iife: 'iife',
  umd: 'umd',
  dts: 'dts',
  dcts: 'dcts',
};

// ---------------------------------------------------------------------------
// Watch mode (left untouched per scope decision; uses legacy plugin pipeline)
// ---------------------------------------------------------------------------

function buildWatchConfigs(
  opts: ResolvedOptions,
  externalIds: string[],
  aliases: AliasEntry[],
): RollupOptions[] {
  const configs: RollupOptions[] = [];
  const inputAll: Record<string, string> = {};
  for (const [name, file] of Object.entries(opts.entryMap)) {
    inputAll[name] = resolve(opts.workspaceRoot, opts.projectRoot, file);
  }
  const primary = resolve(opts.workspaceRoot, opts.projectRoot, opts.entryMap[opts.primaryEntryName]);
  const baseInput: Omit<InputOptions, 'input' | 'plugins'> = {
    external: buildExternalFn(externalIds),
    treeshake: opts.treeshake,
  };

  if (opts.formats.esm.perFile) {
    configs.push({
      input: inputAll,
      ...baseInput,
      plugins: buildPlugins(opts, 'esm', aliases),
      output: {
        dir: opts.outputPath,
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: resolve(opts.workspaceRoot, opts.projectRoot, 'src'),
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name]-[hash].js',
        sourcemap: opts.sourcemap,
      },
    });
  }
  if (opts.formats.cjs.perFile) {
    configs.push({
      input: inputAll,
      ...baseInput,
      plugins: buildPlugins(opts, 'cjs', aliases),
      output: {
        dir: opts.outputPath,
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: resolve(opts.workspaceRoot, opts.projectRoot, 'src'),
        entryFileNames: '[name].cjs',
        chunkFileNames: '_chunks/[name]-[hash].cjs',
        sourcemap: opts.sourcemap,
      },
    });
  }
  if (opts.formats.esm.flat) {
    configs.push({
      input: primary,
      ...baseInput,
      plugins: buildPlugins(opts, 'esm', aliases),
      output: {
        file: resolve(opts.outputPath, 'fesm', `${opts.name}.mjs`),
        format: 'es',
        sourcemap: opts.sourcemap,
      },
    });
  }
  return configs;
}

async function runWatch(
  opts: ResolvedOptions,
  externalIds: string[],
  aliases: AliasEntry[],
): Promise<{ success: boolean }> {
  const configs = buildWatchConfigs(opts, externalIds, aliases);
  if (configs.length === 0) {
    console.warn('[ts-builder-v2] No formats enabled for watch.');
    return { success: true };
  }
  const watcher: RollupWatcher = rollupWatch(configs);
  return new Promise((resolveP) => {
    watcher.on('event', (event) => {
      if (event.code === 'ERROR') {
        console.error('[ts-builder-v2] watch error:', event.error);
      } else if (event.code === 'BUNDLE_END') {
        console.log(`[ts-builder-v2] rebuilt ${event.output.join(', ')} in ${event.duration}ms`);
        event.result?.close();
      } else if (event.code === 'END') {
        console.log('[ts-builder-v2] watching for changes...');
      }
    });
    process.once('SIGINT', () => {
      watcher.close();
      resolveP({ success: true });
    });
    process.once('SIGTERM', () => {
      watcher.close();
      resolveP({ success: true });
    });
  });
}

// ---------------------------------------------------------------------------
// Option resolution
// ---------------------------------------------------------------------------

async function resolveOptions(
  raw: TsBuilderV2ExecutorSchema,
  context: ExecutorContext,
): Promise<ResolvedOptions> {
  const projectName = context.projectName as string;
  const workspaceRoot = context.root;
  const projectRoot = context.projectsConfigurations?.projects?.[projectName]?.root ?? '.';

  const tsConfigPathRaw = raw.tsConfigPath ?? 'tsconfig.lib.json';
  const tsConfigPath = resolveTsConfigAbsolute(tsConfigPathRaw, projectRoot, workspaceRoot);

  const outputPath = isAbsolute(raw.outputPath ?? '')
    ? (raw.outputPath as string)
    : resolve(workspaceRoot, raw.outputPath ?? `dist/${projectRoot}`);

  const entryMap = await normalizeEntry(raw.entry, projectRoot, workspaceRoot, raw.sourceRoot ?? 'src');
  const primaryEntryName = 'index' in entryMap ? 'index' : Object.keys(entryMap)[0];
  const name = raw.name ?? projectName;

  const formats: ResolvedFormats = {
    esm: resolveEsm(raw.formats?.esm),
    cjs: resolveCjs(raw.formats?.cjs),
    iife: raw.formats?.iife ? (raw.formats.iife as IifeFormatOptions) : null,
    umd: raw.formats?.umd ? (raw.formats.umd as UmdFormatOptions) : null,
    types: resolveTypes(raw.formats?.types),
  };

  return {
    tsConfigPath,
    outputPath,
    entryMap,
    primaryEntryName,
    name,
    formats,
    external: raw.external ?? 'auto',
    bundleDependencies: raw.bundleDependencies ?? [],
    sourcemap: raw.sourcemap ?? true,
    treeshake: raw.treeshake ?? true,
    minify: resolveMinify(raw.minify),
    clean: raw.clean ?? true,
    watch: raw.watch ?? false,
    replace: raw.replace ?? {},
    tsconfigPaths: raw.tsconfigPaths ?? true,
    outputManifest: raw.outputManifest ?? true,
    concurrency:
      typeof raw.concurrency === 'number' && raw.concurrency >= 1
        ? Math.floor(raw.concurrency)
        : Math.max(1, Math.min(6, Math.floor(cpus().length / 2))),
    projectRoot,
    workspaceRoot,
    projectName,
  };
}

// ---------------------------------------------------------------------------
// Executor entry point
// ---------------------------------------------------------------------------

const runExecutor: PromiseExecutor<TsBuilderV2ExecutorSchema> = async (rawOptions, context) => {
  try {
    const opts = await resolveOptions(rawOptions, context);

    if (!existsSync(opts.tsConfigPath)) {
      console.error(`[ts-builder-v2] tsconfig not found: ${opts.tsConfigPath}`);
      return { success: false };
    }

    if (opts.clean && existsSync(opts.outputPath) && !opts.watch) {
      await rm(opts.outputPath, { recursive: true, force: true });
    }
    await mkdir(opts.outputPath, { recursive: true });

    let externalIds: string[];
    if (opts.external === 'auto') {
      externalIds = await deriveAutoExternals(opts.projectRoot, opts.workspaceRoot);
    } else {
      externalIds = [...opts.external];
    }
    if (opts.bundleDependencies.length > 0) {
      const bundleSet = new Set(opts.bundleDependencies);
      externalIds = externalIds.filter((id) => !bundleSet.has(id));
    }

    const aliases = opts.tsconfigPaths ? await loadWorkspaceAliases(opts.workspaceRoot) : [];

    if (opts.watch) {
      return await runWatch(opts, externalIds, aliases);
    }

    const tasks = planFormatTasks(opts.formats, {
      libName: opts.name,
      primaryEntryName: opts.primaryEntryName,
      defaultMinify: { iife: opts.minify.iife, umd: opts.minify.umd },
    });
    if (tasks.length === 0) {
      console.warn('[ts-builder-v2] no output formats enabled.');
      return { success: true };
    }

    console.log(`[ts-builder-v2] building ${opts.projectName}: ${tasks.map((t) => t.label).join(', ')}`);
    console.log(`[ts-builder-v2] output: ${relative(opts.workspaceRoot, opts.outputPath) || opts.outputPath}`);

    const start = Date.now();
    // Run TypeScript diagnostics once for the whole project before any rollup
    // build. The transpile-only plugin used per-format skips type checking; we
    // recover full type safety here.
    const diagStart = Date.now();
    clearEmitCache();
    const diag = runProjectDiagnostics(opts.tsConfigPath);
    if (diag.hasErrors) {
      console.error(diag.formatted);
      console.error(`[ts-builder-v2] ${symbols().fail} typecheck failed`);
      return { success: false };
    }
    console.log(`[ts-builder-v2] ${symbols().ok} typecheck (${Date.now() - diagStart}ms)`);

    // Two-bucket scheduling: rollup-plugin-dts spins up its own TypeScript
    // program per build and is the dominant memory consumer (running d.ts and
    // d.cts in parallel with per-file ESM/CJS easily blows the 4GB Node heap
    // on libraries with ~100 entries). We run lightweight format builds
    // (esm/cjs/iife/umd, all backed by the shared TS emit cache) in parallel
    // up to `concurrency`, then run the heavy declaration builds serially.
    const heavyKinds = new Set<FormatBuildResult['task']['kind']>(['dts', 'dcts']);
    const lightTasks = tasks.filter((t) => !heavyKinds.has(t.kind));
    const heavyTasks = tasks.filter((t) => heavyKinds.has(t.kind));

    const limit = createLimit(opts.concurrency);
    const runTask = async (task: (typeof tasks)[number]): Promise<FormatBuildResult> => {
      const tStart = Date.now();
      const result = await runFormatBuild(opts, task, externalIds, aliases);
      console.log(`[ts-builder-v2] ${symbols().ok} ${task.label} (${Date.now() - tStart}ms)`);
      return result;
    };

    const lightResults = await Promise.all(lightTasks.map((t) => limit(() => runTask(t))));
    const heavyResults: FormatBuildResult[] = [];
    for (const t of heavyTasks) heavyResults.push(await runTask(t));
    // Preserve the planned order so the manifest output sequence stays stable.
    const orderIndex = new Map(tasks.map((t, i) => [t, i]));
    const results: FormatBuildResult[] = [...lightResults, ...heavyResults].sort(
      (a, b) => (orderIndex.get(a.task) ?? 0) - (orderIndex.get(b.task) ?? 0),
    );

    if (opts.outputManifest !== false) {
      const projectPkg = await readJson<{ version?: string }>(
        resolve(opts.workspaceRoot, opts.projectRoot, 'package.json'),
      );
      const manifest = buildManifestObject({
        name: opts.name,
        version: projectPkg?.version ?? '0.0.0',
        distPath: opts.outputPath,
        projectRoot: opts.projectRoot,
        workspaceRoot: opts.workspaceRoot,
        entryMap: opts.entryMap,
        results: results.map((r) => ({
          formatKey: FORMAT_KIND_TO_MANIFEST_KEY[r.task.kind],
          entries: r.entries,
        })),
      });
      const written = await writeManifest(opts.outputPath, manifest, opts.outputManifest);
      if (written) {
        console.log(`[ts-builder-v2] manifest: ${relative(opts.workspaceRoot, written) || written}`);
      }
    }

    console.log(`[ts-builder-v2] done in ${Date.now() - start}ms`);

    return { success: true };
  } catch (err) {
    console.error(formatBuildError('[ts-builder-v2]', err));
    return { success: false };
  }
};

export default runExecutor;
