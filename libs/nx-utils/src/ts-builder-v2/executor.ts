import type { ExecutorContext, PromiseExecutor } from '@nx/devkit';
import { builtinModules } from 'node:module';
import { rm, readFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

import {
  rollup,
  watch as rollupWatch,
  type InputOptions,
  type OutputOptions,
  type Plugin,
  type RollupBuild,
  type RollupOptions,
  type RollupWatcher,
} from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replacePlugin from '@rollup/plugin-replace';
import aliasPlugin from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
// rollup-plugin-dts is ESM-only; loaded via dynamic import.
type DtsPlugin = (opts?: { tsconfig?: string; respectExternal?: boolean }) => Plugin;
let dtsPluginCache: DtsPlugin | undefined;
async function loadDtsPlugin(): Promise<DtsPlugin> {
  if (!dtsPluginCache) {
    const mod = await import('rollup-plugin-dts');
    dtsPluginCache = (mod.dts ?? (mod as { default?: DtsPlugin }).default) as DtsPlugin;
  }
  return dtsPluginCache;
}

import type {
  CjsFormatOptions,
  EsmFormatOptions,
  FormatsOptions,
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

interface ResolvedOptions {
  tsConfigPath: string;
  outputPath: string;
  entryMap: Record<string, string>;
  primaryEntryName: string;
  name: string;
  formats: ResolvedFormats;
  external: string[] | 'auto';
  bundleDependencies: string[];
  sourcemap: boolean | 'inline' | 'hidden';
  treeshake: boolean;
  minify: ResolvedMinify;
  clean: boolean;
  watch: boolean;
  replace: Record<string, string>;
  tsconfigPaths: boolean;
  projectRoot: string;
  workspaceRoot: string;
  projectName: string;
}

const NODE_BUILTINS = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]);

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

async function walkTsFiles(absDir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: import('node:fs').Dirent[];
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(absDir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      out.push(...(await walkTsFiles(full)));
    } else if (e.isFile()) {
      if (!/\.tsx?$/.test(e.name)) continue;
      if (/\.spec\.tsx?$/.test(e.name)) continue;
      if (/\.test\.tsx?$/.test(e.name)) continue;
      if (/\.stories\.tsx?$/.test(e.name)) continue;
      if (/\.d\.ts$/.test(e.name)) continue;
      out.push(full);
    }
  }
  return out;
}

async function autoDiscoverEntries(
  projectRoot: string,
  workspaceRoot: string,
  sourceRoot: string,
): Promise<Record<string, string>> {
  const absSrc = resolve(workspaceRoot, projectRoot, sourceRoot);
  const files = await walkTsFiles(absSrc);
  const map: Record<string, string> = {};
  for (const abs of files) {
    const relFromSrc = relative(absSrc, abs).replace(/\\/g, '/');
    const name = relFromSrc.replace(/\.tsx?$/, '');
    const relFromProject = relative(resolve(workspaceRoot, projectRoot), abs).replace(/\\/g, '/');
    map[name] = relFromProject;
  }
  return map;
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

async function readJson<T = unknown>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function deriveAutoExternals(projectRoot: string, workspaceRoot: string): Promise<string[]> {
  const pkg = await readJson<{ dependencies?: Record<string, string>; peerDependencies?: Record<string, string> }>(
    resolve(workspaceRoot, projectRoot, 'package.json'),
  );
  const deps = new Set<string>();
  if (pkg?.dependencies) Object.keys(pkg.dependencies).forEach((d) => deps.add(d));
  if (pkg?.peerDependencies) Object.keys(pkg.peerDependencies).forEach((d) => deps.add(d));
  // tslib is implicitly required by TypeScript with `importHelpers: true`.
  deps.add('tslib');
  for (const b of NODE_BUILTINS) deps.add(b);
  return [...deps];
}

async function loadWorkspaceAliases(workspaceRoot: string): Promise<Array<{ find: string | RegExp; replacement: string }>> {
  const tsconfig = await readJson<{
    compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
  }>(resolve(workspaceRoot, 'tsconfig.base.json'));
  const paths = tsconfig?.compilerOptions?.paths;
  const baseUrl = tsconfig?.compilerOptions?.baseUrl ?? '.';
  if (!paths) return [];
  const baseDir = resolve(workspaceRoot, baseUrl);
  const aliases: Array<{ find: string | RegExp; replacement: string }> = [];
  for (const [pattern, targets] of Object.entries(paths)) {
    if (!targets || targets.length === 0) continue;
    const target = targets[0];
    if (pattern.endsWith('/*') && target.endsWith('/*')) {
      const findPrefix = pattern.slice(0, -2);
      const replacementPrefix = resolve(baseDir, target.slice(0, -2));
      aliases.push({
        find: new RegExp(`^${findPrefix.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}/(.*)$`),
        replacement: `${replacementPrefix}/$1`,
      });
    } else {
      aliases.push({
        find: pattern,
        replacement: resolve(baseDir, target),
      });
    }
  }
  // Sort longest-first so more specific aliases match before broader ones.
  return aliases.sort((a, b) => {
    const sa = typeof a.find === 'string' ? a.find.length : a.find.source.length;
    const sb = typeof b.find === 'string' ? b.find.length : b.find.source.length;
    return sb - sa;
  });
}

function buildExternalFn(externals: string[]): (id: string) => boolean {
  const set = new Set(externals);
  return (id: string) => {
    if (set.has(id)) return true;
    // Match scoped/unscoped subpath imports (e.g. `lit/decorators.js` when `lit` is external).
    for (const ext of set) {
      if (id === ext || id.startsWith(`${ext}/`)) return true;
    }
    return false;
  };
}

function buildPlugins(opts: ResolvedOptions, format: 'esm' | 'cjs' | 'iife' | 'umd', aliases: Array<{ find: string | RegExp; replacement: string }>): Plugin[] {
  const plugins: Plugin[] = [];
  if (opts.tsconfigPaths && aliases.length > 0) {
    plugins.push(aliasPlugin({ entries: aliases }));
  }
  if (Object.keys(opts.replace).length > 0) {
    plugins.push(
      replacePlugin({
        preventAssignment: true,
        values: opts.replace,
      }),
    );
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
    typescript({
      tsconfig: opts.tsConfigPath,
      compilerOptions: {
        // Rollup requires ES module output to perform tree-shaking.
        module: 'esnext',
        moduleResolution: 'bundler',
        declaration: false,
        declarationMap: false,
        emitDeclarationOnly: false,
        sourceMap: opts.sourcemap !== false,
        inlineSources: opts.sourcemap === 'inline',
        outDir: undefined,
      },
      noEmitOnError: true,
    } as Parameters<typeof typescript>[0]),
  );
  if (opts.minify[format]) {
    plugins.push(terser());
  }
  return plugins;
}

function getPrimaryEntryFile(opts: ResolvedOptions): string {
  return opts.entryMap[opts.primaryEntryName];
}

async function buildEsmPerFile(opts: ResolvedOptions, externalIds: string[], aliases: Array<{ find: string | RegExp; replacement: string }>) {
  const input: Record<string, string> = {};
  for (const [name, file] of Object.entries(opts.entryMap)) {
    input[name] = resolve(opts.workspaceRoot, opts.projectRoot, file);
  }
  const inputOptions: InputOptions = {
    input,
    external: buildExternalFn(externalIds),
    treeshake: opts.treeshake,
    plugins: buildPlugins(opts, 'esm', aliases),
  };
  const outputOptions: OutputOptions = {
    dir: opts.outputPath,
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: resolve(opts.workspaceRoot, opts.projectRoot, 'src'),
    entryFileNames: '[name].js',
    chunkFileNames: '_chunks/[name]-[hash].js',
    sourcemap: opts.sourcemap,
    exports: 'auto',
  };
  await runOnce(inputOptions, [outputOptions]);
}

async function buildCjsPerFile(opts: ResolvedOptions, externalIds: string[], aliases: Array<{ find: string | RegExp; replacement: string }>) {
  const input: Record<string, string> = {};
  for (const [name, file] of Object.entries(opts.entryMap)) {
    input[name] = resolve(opts.workspaceRoot, opts.projectRoot, file);
  }
  const inputOptions: InputOptions = {
    input,
    external: buildExternalFn(externalIds),
    treeshake: opts.treeshake,
    plugins: buildPlugins(opts, 'cjs', aliases),
  };
  const outputOptions: OutputOptions = {
    dir: opts.outputPath,
    format: 'cjs',
    preserveModules: true,
    preserveModulesRoot: resolve(opts.workspaceRoot, opts.projectRoot, 'src'),
    entryFileNames: '[name].cjs',
    chunkFileNames: '_chunks/[name]-[hash].cjs',
    sourcemap: opts.sourcemap,
    exports: 'auto',
  };
  await runOnce(inputOptions, [outputOptions]);
}

async function buildEsmFlat(opts: ResolvedOptions, externalIds: string[], aliases: Array<{ find: string | RegExp; replacement: string }>) {
  const inputOptions: InputOptions = {
    input: resolve(opts.workspaceRoot, opts.projectRoot, getPrimaryEntryFile(opts)),
    external: buildExternalFn(externalIds),
    treeshake: opts.treeshake,
    plugins: buildPlugins(opts, 'esm', aliases),
  };
  const outputOptions: OutputOptions = {
    file: resolve(opts.outputPath, 'fesm', `${opts.name}.mjs`),
    format: 'es',
    sourcemap: opts.sourcemap,
    exports: 'auto',
  };
  await runOnce(inputOptions, [outputOptions]);
}

async function buildCjsFlat(opts: ResolvedOptions, externalIds: string[], aliases: Array<{ find: string | RegExp; replacement: string }>) {
  const inputOptions: InputOptions = {
    input: resolve(opts.workspaceRoot, opts.projectRoot, getPrimaryEntryFile(opts)),
    external: buildExternalFn(externalIds),
    treeshake: opts.treeshake,
    plugins: buildPlugins(opts, 'cjs', aliases),
  };
  const outputOptions: OutputOptions = {
    file: resolve(opts.outputPath, `${opts.name}.cjs`),
    format: 'cjs',
    sourcemap: opts.sourcemap,
    exports: 'auto',
  };
  await runOnce(inputOptions, [outputOptions]);
}

async function buildIife(
  opts: ResolvedOptions,
  iifeOpts: IifeFormatOptions,
  aliases: Array<{ find: string | RegExp; replacement: string }>,
) {
  const externalIds = Object.keys(iifeOpts.globals ?? {});
  const fileBase = iifeOpts.fileName ?? opts.name;
  const minify = iifeOpts.minify ?? opts.minify.iife;
  const inputOptions: InputOptions = {
    input: resolve(opts.workspaceRoot, opts.projectRoot, getPrimaryEntryFile(opts)),
    external: buildExternalFn(externalIds),
    treeshake: opts.treeshake,
    plugins: buildPlugins({ ...opts, minify: { ...opts.minify, iife: minify } }, 'iife', aliases),
  };
  const outputs: OutputOptions[] = [
    {
      file: resolve(opts.outputPath, 'iife', `${fileBase}.js`),
      format: 'iife',
      name: iifeOpts.name,
      globals: iifeOpts.globals,
      sourcemap: opts.sourcemap,
      exports: 'auto',
      inlineDynamicImports: true,
    },
  ];
  await runOnce(inputOptions, outputs);
}

async function buildUmd(
  opts: ResolvedOptions,
  umdOpts: UmdFormatOptions,
  aliases: Array<{ find: string | RegExp; replacement: string }>,
) {
  const externalIds = Object.keys(umdOpts.globals ?? {});
  const fileBase = umdOpts.fileName ?? opts.name;
  const minify = umdOpts.minify ?? opts.minify.umd;
  const inputOptions: InputOptions = {
    input: resolve(opts.workspaceRoot, opts.projectRoot, getPrimaryEntryFile(opts)),
    external: buildExternalFn(externalIds),
    treeshake: opts.treeshake,
    plugins: buildPlugins({ ...opts, minify: { ...opts.minify, umd: minify } }, 'umd', aliases),
  };
  const outputs: OutputOptions[] = [
    {
      file: resolve(opts.outputPath, 'umd', `${fileBase}.js`),
      format: 'umd',
      name: umdOpts.name,
      globals: umdOpts.globals,
      sourcemap: opts.sourcemap,
      exports: 'auto',
      inlineDynamicImports: true,
    },
  ];
  await runOnce(inputOptions, outputs);
}

async function buildTypes(
  opts: ResolvedOptions,
  externalIds: string[],
  aliases: Array<{ find: string | RegExp; replacement: string }>,
  extension: 'd.ts' | 'd.cts',
) {
  const input: Record<string, string> = {};
  for (const [name, file] of Object.entries(opts.entryMap)) {
    input[name] = resolve(opts.workspaceRoot, opts.projectRoot, file);
  }
  const plugins: Plugin[] = [];
  if (opts.tsconfigPaths && aliases.length > 0) {
    plugins.push(aliasPlugin({ entries: aliases }));
  }
  const dts = await loadDtsPlugin();
  plugins.push(
    dts({
      tsconfig: opts.tsConfigPath,
      respectExternal: true,
    }),
  );
  const inputOptions: InputOptions = {
    input,
    external: buildExternalFn(externalIds),
    plugins,
  };
  const outputOptions: OutputOptions = {
    dir: opts.outputPath,
    format: 'es',
    entryFileNames: `[name].${extension}`,
    chunkFileNames: `_chunks/[name]-[hash].${extension}`,
  };
  await runOnce(inputOptions, [outputOptions]);
}

async function runOnce(inputOptions: InputOptions, outputs: OutputOptions[]): Promise<void> {
  let bundle: RollupBuild | undefined;
  try {
    bundle = await rollup({
      ...inputOptions,
      onwarn(warning, defaultHandler) {
        // Suppress noisy class-field warnings.
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        defaultHandler(warning);
      },
    });
    for (const out of outputs) {
      await bundle.write(out);
    }
  } finally {
    await bundle?.close();
  }
}

function buildWatchConfigs(
  opts: ResolvedOptions,
  externalIds: string[],
  aliases: Array<{ find: string | RegExp; replacement: string }>,
): RollupOptions[] {
  const configs: RollupOptions[] = [];
  const inputAll: Record<string, string> = {};
  for (const [name, file] of Object.entries(opts.entryMap)) {
    inputAll[name] = resolve(opts.workspaceRoot, opts.projectRoot, file);
  }
  const primary = resolve(opts.workspaceRoot, opts.projectRoot, getPrimaryEntryFile(opts));

  if (opts.formats.esm.perFile) {
    configs.push({
      input: inputAll,
      external: buildExternalFn(externalIds),
      treeshake: opts.treeshake,
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
      external: buildExternalFn(externalIds),
      treeshake: opts.treeshake,
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
      external: buildExternalFn(externalIds),
      treeshake: opts.treeshake,
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
  aliases: Array<{ find: string | RegExp; replacement: string }>,
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
  const primaryEntryName =
    'index' in entryMap ? 'index' : Object.keys(entryMap)[0];
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
    projectRoot,
    workspaceRoot,
    projectName,
  };
}

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

    const tasks: Array<{ label: string; run: () => Promise<void> }> = [];

    if (opts.formats.esm.perFile) {
      tasks.push({ label: 'esm (per-file)', run: () => buildEsmPerFile(opts, externalIds, aliases) });
    }
    if (opts.formats.esm.flat) {
      tasks.push({ label: 'esm (flat)', run: () => buildEsmFlat(opts, externalIds, aliases) });
    }
    if (opts.formats.cjs.perFile) {
      tasks.push({ label: 'cjs (per-file)', run: () => buildCjsPerFile(opts, externalIds, aliases) });
    }
    if (opts.formats.cjs.flat) {
      tasks.push({ label: 'cjs (flat)', run: () => buildCjsFlat(opts, externalIds, aliases) });
    }
    if (opts.formats.iife) {
      tasks.push({ label: 'iife', run: () => buildIife(opts, opts.formats.iife as IifeFormatOptions, aliases) });
    }
    if (opts.formats.umd) {
      tasks.push({ label: 'umd', run: () => buildUmd(opts, opts.formats.umd as UmdFormatOptions, aliases) });
    }
    if (opts.formats.types.dts) {
      tasks.push({ label: 'd.ts', run: () => buildTypes(opts, externalIds, aliases, 'd.ts') });
    }
    if (opts.formats.types.dcts) {
      tasks.push({ label: 'd.cts', run: () => buildTypes(opts, externalIds, aliases, 'd.cts') });
    }

    if (tasks.length === 0) {
      console.warn('[ts-builder-v2] no output formats enabled.');
      return { success: true };
    }

    console.log(`[ts-builder-v2] building ${opts.projectName}: ${tasks.map((t) => t.label).join(', ')}`);
    console.log(`[ts-builder-v2] output: ${relative(opts.workspaceRoot, opts.outputPath) || opts.outputPath}`);

    const start = Date.now();
    // Run sequentially: parallel rollup builds with many entries spike memory and
    // can OOM the Node process (each build instantiates its own TS program).
    for (const t of tasks) {
      const tStart = Date.now();
      await t.run();
      console.log(`[ts-builder-v2] ✓ ${t.label} (${Date.now() - tStart}ms)`);
    }
    console.log(`[ts-builder-v2] done in ${Date.now() - start}ms`);

    return { success: true };
  } catch (err) {
    console.error('[ts-builder-v2] build failed:', err);
    return { success: false };
  }
};

export default runExecutor;
