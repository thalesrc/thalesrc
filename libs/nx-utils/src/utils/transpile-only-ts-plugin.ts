import { extname } from 'node:path';

import type { Plugin } from 'rollup';
import * as ts from 'typescript';

import { loadTsConfig } from './ts-program';

interface TranspileOptions {
  /** Absolute path to the project's tsconfig.json. */
  tsConfigPath: string;
  /**
   * Per-build compiler option overrides. Used to flip `esnext` module / target
   * regardless of what the source tsconfig declares so Rollup always receives
   * tree-shake-friendly ESM input.
   */
  overrides?: ts.CompilerOptions;
  /** Whether to emit source maps with the transformed output. */
  sourceMap?: boolean;
}

const TS_EXTS = new Set(['.ts', '.tsx', '.mts', '.cts']);

/**
 * A minimal Rollup plugin that runs `ts.transpileModule` per file. Skips
 * type-checking entirely — diagnostics are produced once up-front by
 * {@link runProjectDiagnostics} so we don't pay for a full LanguageService per
 * format build.
 *
 * Replaces `@rollup/plugin-typescript`, which spins up an isolated
 * LanguageService for every Rollup build (8 formats × N entries multiplied the
 * cost on large libraries like `js-utils`).
 */
export function transpileOnlyTs(options: TranspileOptions): Plugin {
  const parsed = loadTsConfig(options.tsConfigPath);
  const baseOptions: ts.CompilerOptions = {
    ...parsed.options,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    declaration: false,
    declarationMap: false,
    emitDeclarationOnly: false,
    sourceMap: options.sourceMap !== false,
    inlineSources: false,
    noEmit: false,
    outDir: undefined,
    ...(options.overrides ?? {}),
  };

  return {
    name: 'transpile-only-ts',
    transform(code, id) {
      if (!TS_EXTS.has(extname(id))) return null;
      const out = ts.transpileModule(code, {
        compilerOptions: baseOptions,
        fileName: id,
        reportDiagnostics: false,
      });
      if (!out.outputText) return null;
      return {
        code: out.outputText,
        map: out.sourceMapText ?? null,
      };
    },
  };
}
