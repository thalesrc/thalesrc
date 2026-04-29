import { extname, normalize, resolve } from 'node:path';

import type { Plugin } from 'rollup';
import * as ts from 'typescript';

import { loadTsConfig } from './ts-program';

interface ProgramEmitterOptions {
  tsConfigPath: string;
  /** When true, source maps are emitted as separate fields. */
  sourceMap?: boolean;
}

interface EmittedFile {
  code: string;
  map: string | null;
}

/**
 * Build a Rollup plugin that resolves and loads TypeScript sources by sharing
 * a single `ts.Program.emit()` across all rollup runs for the same tsconfig.
 *
 * We emit through the real TypeScript compiler (rather than per-file
 * `ts.transpileModule`) so that:
 *
 *   - Type-only re-exports (`export { Foo }` where `Foo` is a type) are
 *     correctly elided. `transpileModule` cannot do this without project-wide
 *     type information.
 *   - Const enum / cross-file declaration-merging emits stay consistent.
 *
 * The compile is cached per tsconfig path, so subsequent format builds (esm,
 * cjs, etc.) reuse the same emitted JavaScript instead of paying for another
 * full TypeScript pass — the original motivation for Phase 4.
 */
const emitCache = new Map<string, Map<string, EmittedFile>>();

function emitProject(tsConfigPath: string, sourceMap: boolean): Map<string, EmittedFile> {
  const key = `${resolve(tsConfigPath)}::${sourceMap ? 'map' : 'nomap'}`;
  const cached = emitCache.get(key);
  if (cached) return cached;

  const parsed = loadTsConfig(tsConfigPath);
  const compilerOptions: ts.CompilerOptions = {
    ...parsed.options,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    declaration: false,
    declarationMap: false,
    emitDeclarationOnly: false,
    sourceMap,
    inlineSources: false,
    inlineSourceMap: false,
    noEmit: false,
    noEmitOnError: false,
    outDir: undefined,
  };

  const host = ts.createCompilerHost(compilerOptions);
  const outputs = new Map<string, EmittedFile>();
  // ts emits writeFile callbacks with `.js`/`.js.map` paths derived from the
  // source `.ts` path. We index by the absolute source path so the rollup
  // `load` hook can look it up directly.
  const writeFile: ts.WriteFileCallback = (fileName, text) => {
    const norm = normalize(fileName);
    if (norm.endsWith('.map')) {
      const sourcePath = norm.slice(0, -'.map'.length);
      const ext = sourcePath.endsWith('.js') ? '.js' : '.cjs';
      const tsPath = sourcePath.slice(0, -ext.length) + '.ts';
      const tsxPath = sourcePath.slice(0, -ext.length) + '.tsx';
      const existing = outputs.get(tsPath) ?? outputs.get(tsxPath);
      if (existing) existing.map = text;
      return;
    }
    const ext = norm.endsWith('.js') ? '.js' : norm.endsWith('.cjs') ? '.cjs' : null;
    if (!ext) return;
    const tsPath = norm.slice(0, -ext.length) + '.ts';
    const tsxPath = norm.slice(0, -ext.length) + '.tsx';
    const target = outputs.get(tsPath) ? tsPath : outputs.has(tsxPath) ? tsxPath : tsPath;
    outputs.set(target, { code: text, map: outputs.get(target)?.map ?? null });
  };

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: compilerOptions,
    host,
  });
  // Pre-seed the map keyed by source path so `writeFile` can find it.
  for (const f of parsed.fileNames) {
    outputs.set(normalize(f), { code: '', map: null });
  }
  program.emit(undefined, writeFile, undefined, false);

  emitCache.set(key, outputs);
  return outputs;
}

const TS_EXTS = new Set(['.ts', '.tsx', '.mts', '.cts']);

/**
 * Rollup plugin that loads TypeScript files from the shared program emit.
 * Replaces `@rollup/plugin-typescript`, which spins up an isolated
 * LanguageService for every Rollup build.
 */
export function programEmitTs(options: ProgramEmitterOptions): Plugin {
  const sourceMap = options.sourceMap !== false;
  const outputs = emitProject(options.tsConfigPath, sourceMap);

  return {
    name: 'program-emit-ts',
    load(id) {
      if (!TS_EXTS.has(extname(id))) return null;
      const found = outputs.get(normalize(id));
      if (!found || !found.code) return null;
      return { code: found.code, map: found.map };
    },
  };
}

/**
 * Drop cached emit so a new executor invocation (e.g. watch mode rebuild)
 * picks up source changes. Called between builds; keep cheap.
 */
export function clearEmitCache(): void {
  emitCache.clear();
}
