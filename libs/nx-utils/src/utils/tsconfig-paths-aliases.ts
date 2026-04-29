import { resolve } from 'node:path';
import { readJson } from './read-json';

export interface AliasEntry {
  find: string | RegExp;
  replacement: string;
}

interface TsConfigPathsShape {
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[]>;
  };
}

/**
 * Read the workspace `tsconfig.base.json` and convert its `compilerOptions.paths`
 * into entries usable by `@rollup/plugin-alias`. Aliases are sorted longest-first
 * so that more specific patterns (e.g. `pkg/sub/*`) shadow broader ones (`pkg/*`).
 */
export async function loadWorkspaceAliases(
  workspaceRoot: string,
  tsconfigFile = 'tsconfig.base.json',
): Promise<AliasEntry[]> {
  const tsconfig = await readJson<TsConfigPathsShape>(resolve(workspaceRoot, tsconfigFile));
  const paths = tsconfig?.compilerOptions?.paths;
  const baseUrl = tsconfig?.compilerOptions?.baseUrl ?? '.';
  if (!paths) return [];
  const baseDir = resolve(workspaceRoot, baseUrl);
  const aliases: AliasEntry[] = [];
  for (const [pattern, targets] of Object.entries(paths)) {
    if (!targets || targets.length === 0) continue;
    const target = targets[0];
    if (pattern.endsWith('/*') && target.endsWith('/*')) {
      const findPrefix = pattern.slice(0, -2);
      const replacementPrefix = resolve(baseDir, target.slice(0, -2));
      aliases.push({
        find: new RegExp(`^${findPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(.*)$`),
        replacement: `${replacementPrefix}/$1`,
      });
    } else {
      aliases.push({
        find: pattern,
        replacement: resolve(baseDir, target),
      });
    }
  }
  return aliases.sort((a, b) => {
    const sa = typeof a.find === 'string' ? a.find.length : a.find.source.length;
    const sb = typeof b.find === 'string' ? b.find.length : b.find.source.length;
    return sb - sa;
  });
}
