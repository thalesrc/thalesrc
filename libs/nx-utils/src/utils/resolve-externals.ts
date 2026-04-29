import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { readJson } from './read-json';

interface PackageJsonShape {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export const NODE_BUILTINS: ReadonlySet<string> = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]);

/**
 * Return the set of module IDs that should be treated as external by Rollup
 * for a project: its dependencies, peerDependencies, `tslib` (implicit
 * `importHelpers`), and all Node.js built-in modules (with and without the
 * `node:` prefix).
 */
export async function deriveAutoExternals(projectRoot: string, workspaceRoot: string): Promise<string[]> {
  const pkg = await readJson<PackageJsonShape>(resolve(workspaceRoot, projectRoot, 'package.json'));
  const deps = new Set<string>();
  if (pkg?.dependencies) Object.keys(pkg.dependencies).forEach((d) => deps.add(d));
  if (pkg?.peerDependencies) Object.keys(pkg.peerDependencies).forEach((d) => deps.add(d));
  // tslib is implicitly required by TypeScript with `importHelpers: true`.
  deps.add('tslib');
  for (const b of NODE_BUILTINS) deps.add(b);
  return [...deps];
}

/**
 * Build a Rollup `external` predicate that matches any id that is exactly one
 * of the given external IDs, or that begins with `<external>/` (covers scoped
 * subpath imports like `lit/decorators.js`).
 */
export function buildExternalFn(externals: string[]): (id: string) => boolean {
  const set = new Set(externals);
  return (id: string) => {
    if (set.has(id)) return true;
    for (const ext of set) {
      if (id === ext || id.startsWith(`${ext}/`)) return true;
    }
    return false;
  };
}
