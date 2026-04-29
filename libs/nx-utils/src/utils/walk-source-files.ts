import { readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

export interface WalkOptions {
  /**
   * Patterns matched against each file's basename. Files that match any
   * pattern are excluded. Defaults to spec/test/stories/.d.ts.
   */
  exclude?: Array<string | RegExp>;
  /**
   * File extensions to include (without leading dot). Defaults to ['ts', 'tsx'].
   */
  extensions?: string[];
}

const DEFAULT_EXCLUDES: RegExp[] = [
  /\.spec\.tsx?$/,
  /\.test\.tsx?$/,
  /\.stories\.tsx?$/,
  /\.d\.ts$/,
];

const DEFAULT_EXTENSIONS = ['ts', 'tsx'];

function compilePatterns(patterns: Array<string | RegExp> | undefined): RegExp[] {
  if (!patterns) return DEFAULT_EXCLUDES;
  return patterns.map((p) => {
    if (p instanceof RegExp) return p;
    // Treat strings as glob-like patterns: escape regex specials, expand `*`.
    const escaped = p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  });
}

/**
 * Recursively walk a directory and return absolute paths to every source file.
 * Skips `node_modules` and any directory whose name starts with `.`.
 */
export async function walkSourceFiles(absDir: string, opts: WalkOptions = {}): Promise<string[]> {
  const excludes = compilePatterns(opts.exclude);
  const extensions = opts.extensions ?? DEFAULT_EXTENSIONS;
  const extRe = new RegExp(`\\.(${extensions.join('|')})$`);
  const out: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: import('node:fs').Dirent[];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        await walk(full);
      } else if (e.isFile()) {
        if (!extRe.test(e.name)) continue;
        if (excludes.some((re) => re.test(e.name))) continue;
        out.push(full);
      }
    }
  }

  await walk(absDir);
  return out;
}

/**
 * Walk `<projectRoot>/<sourceRoot>` and return an entry map suitable for Rollup
 * `input`: `{ '<rel-from-source-root-without-ext>': '<rel-from-project-root>' }`.
 */
export async function autoDiscoverEntries(
  projectRoot: string,
  workspaceRoot: string,
  sourceRoot: string,
  opts: WalkOptions = {},
): Promise<Record<string, string>> {
  const absSrc = resolve(workspaceRoot, projectRoot, sourceRoot);
  const files = await walkSourceFiles(absSrc, opts);
  const map: Record<string, string> = {};
  const extensions = opts.extensions ?? DEFAULT_EXTENSIONS;
  const stripExt = new RegExp(`\\.(${extensions.join('|')})$`);
  for (const abs of files) {
    const relFromSrc = relative(absSrc, abs).replace(/\\/g, '/');
    const name = relFromSrc.replace(stripExt, '');
    const relFromProject = relative(resolve(workspaceRoot, projectRoot), abs).replace(/\\/g, '/');
    map[name] = relFromProject;
  }
  return map;
}
