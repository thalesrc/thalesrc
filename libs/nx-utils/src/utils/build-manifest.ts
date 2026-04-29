import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { readJson } from './read-json';

/**
 * On-disk manifest emitted by `ts-builder-v2` and consumed by
 * `fill-package-json-v2` (and any future tooling that needs to know exactly
 * which files were produced). Stored as a single JSON file at the root of the
 * library's dist directory so it travels with the build artifacts.
 */
export const DEFAULT_MANIFEST_NAME = '.build-manifest.json';

/** Stable keys for every output format produced by `ts-builder-v2`. */
export type ManifestFormatKey =
  | 'esm'
  | 'esmFlat'
  | 'cjs'
  | 'cjsFlat'
  | 'iife'
  | 'umd'
  | 'dts'
  | 'dcts';

export interface ManifestEntry {
  /** Logical entry name (matches the `exports` map subpath). */
  name: string;
  /** Source file relative to the project root, posix slashes. */
  sourcePath: string;
  /** Output file path per format, relative to the dist root, posix slashes. */
  outputs: Partial<Record<ManifestFormatKey, string>>;
}

export interface BuildManifest {
  /** Bumped on incompatible changes; readers must reject unknown versions. */
  schemaVersion: 1;
  /** Project name from project package.json (or executor `name` option). */
  name: string;
  /** Project version from package.json at build time (may be a placeholder). */
  version: string;
  /** Formats that were built (mirrors the keys present on `entries[].outputs`). */
  formats: ManifestFormatKey[];
  /** One entry per logical input. */
  entries: ManifestEntry[];
  /** ISO-8601 build completion timestamp. */
  generatedAt: string;
}

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Write the manifest JSON file. Returns the absolute path it was written to.
 *
 * `target` may be:
 *   - `true` → `<distPath>/.build-manifest.json`
 *   - a relative or absolute file path → used as-is (relative resolved against `distPath`)
 */
export async function writeManifest(
  distPath: string,
  manifest: BuildManifest,
  target: boolean | string = true,
): Promise<string | null> {
  if (target === false) return null;
  const fileName = typeof target === 'string' ? target : DEFAULT_MANIFEST_NAME;
  const absPath = resolve(distPath, fileName);
  await writeFile(absPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  return absPath;
}

/**
 * Read the manifest from a dist directory. Returns null when the file is
 * missing or has an unrecognized schema version.
 */
export async function readManifest(
  distPath: string,
  fileName: string = DEFAULT_MANIFEST_NAME,
): Promise<BuildManifest | null> {
  const absPath = resolve(distPath, fileName);
  const data = await readJson<BuildManifest>(absPath);
  if (!data || typeof data !== 'object') return null;
  if (data.schemaVersion !== 1) return null;
  return data;
}

/**
 * Build a manifest object from the entry source map plus a list of per-format
 * build results. Pivots from `(format, entryName) → absPath` to
 * `(entryName) → { format → relPath }`.
 */
export function buildManifestObject(args: {
  name: string;
  version: string;
  distPath: string;
  /** Project root (for source paths in the manifest). */
  projectRoot: string;
  workspaceRoot: string;
  entryMap: Record<string, string>;
  /**
   * One result per format. Each result carries an `entries` map of
   * `entryName → absolute output file path`.
   */
  results: Array<{ formatKey: ManifestFormatKey; entries: Record<string, string> }>;
}): BuildManifest {
  const { name, version, distPath, projectRoot, workspaceRoot, entryMap, results } = args;
  const distAbs = resolve(distPath);
  const projectAbs = resolve(workspaceRoot, projectRoot);

  // Index outputs by entryName.
  const outputsByEntry = new Map<string, Partial<Record<ManifestFormatKey, string>>>();
  for (const r of results) {
    for (const [entryName, abs] of Object.entries(r.entries)) {
      let bucket = outputsByEntry.get(entryName);
      if (!bucket) {
        bucket = {};
        outputsByEntry.set(entryName, bucket);
      }
      const rel = toPosix(abs.startsWith(distAbs) ? abs.slice(distAbs.length + 1) : abs);
      bucket[r.formatKey] = rel;
    }
  }

  const entries: ManifestEntry[] = Object.entries(entryMap).map(([entryName, src]) => {
    const srcAbs = resolve(projectAbs, src);
    const sourceRel = srcAbs.startsWith(projectAbs)
      ? toPosix(srcAbs.slice(projectAbs.length + 1))
      : toPosix(src);
    return {
      name: entryName,
      sourcePath: sourceRel,
      outputs: outputsByEntry.get(entryName) ?? {},
    };
  });

  // Add any entries that appeared in build results but not in the entry map
  // (e.g. iife/umd primary entries that may share a name).
  for (const [entryName, outputs] of outputsByEntry) {
    if (!entries.find((e) => e.name === entryName)) {
      entries.push({ name: entryName, sourcePath: '', outputs });
    }
  }

  const formatsPresent = new Set<ManifestFormatKey>();
  for (const e of entries) {
    for (const k of Object.keys(e.outputs) as ManifestFormatKey[]) {
      formatsPresent.add(k);
    }
  }

  return {
    schemaVersion: 1,
    name,
    version,
    formats: [...formatsPresent],
    entries,
    generatedAt: new Date().toISOString(),
  };
}
