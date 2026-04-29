import { dirname, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

import * as ts from 'typescript';

/**
 * Parse a `tsconfig.json` (with `extends` resolution) and return its parsed
 * representation. Caches by absolute tsconfig path because every build re-uses
 * the same project config across formats.
 */
const cache = new Map<string, ts.ParsedCommandLine>();

export function loadTsConfig(tsConfigPath: string): ts.ParsedCommandLine {
  const abs = resolve(tsConfigPath);
  const cached = cache.get(abs);
  if (cached) return cached;
  if (!existsSync(abs)) {
    throw new Error(`tsconfig not found: ${abs}`);
  }
  const configText = readFileSync(abs, 'utf-8');
  const parsed = ts.parseConfigFileTextToJson(abs, configText);
  if (parsed.error) {
    throw new Error(formatDiagnostic(parsed.error));
  }
  const cwd = dirname(abs);
  const cmd = ts.parseJsonConfigFileContent(parsed.config, ts.sys, cwd, undefined, abs);
  cache.set(abs, cmd);
  return cmd;
}

function formatDiagnostic(d: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(d.messageText, '\n');
}

/**
 * Run the TypeScript type-checker once across the project's source files and
 * return any error diagnostics. Used by `ts-builder-v2` to surface real type
 * errors that the per-format transpile-only plugin would otherwise hide.
 */
export interface DiagnosticsResult {
  diagnostics: readonly ts.Diagnostic[];
  hasErrors: boolean;
  formatted: string;
}

export function runProjectDiagnostics(tsConfigPath: string): DiagnosticsResult {
  const parsed = loadTsConfig(tsConfigPath);
  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: { ...parsed.options, noEmit: true },
  });
  const all = ts.getPreEmitDiagnostics(program);
  const errors = all.filter((d) => d.category === ts.DiagnosticCategory.Error);
  const host: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n',
  };
  const formatted =
    errors.length > 0 ? ts.formatDiagnosticsWithColorAndContext(errors, host) : '';
  return { diagnostics: all, hasErrors: errors.length > 0, formatted };
}
