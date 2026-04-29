import type { ExecutorContext, PromiseExecutor } from '@nx/devkit';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

import type {
  ExportCondition,
  FillPackageJsonV2ExecutorSchema,
  PopulateExportsOptions,
  PopulateExportsTemplates,
} from './schema';

// Spec-correct condition ordering. Node resolves the first matching condition,
// `types` must come first for TypeScript, `default` must come last as the fallback.
const CONDITION_ORDER: ExportCondition[] = ['types', 'node', 'browser', 'import', 'require', 'default'];

const DEFAULT_TEMPLATES: Required<PopulateExportsTemplates> = {
  types: '<path>.d.ts',
  typesRequire: '<path>.d.cts',
  node: '<path>.cjs',
  import: '<path>.js',
  require: '<path>.cjs',
  default: '<path>.js',
  browser: '<path>.js',
};

const DEFAULT_EXPORTS: ExportCondition[] = ['types', 'node', 'import', 'require', 'default'];

interface PackageJson {
  [key: string]: unknown;
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: Record<string, unknown>;
  sideEffects?: boolean | string[];
}

async function readJson<T = PackageJson>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function applyTemplate(template: string, path: string): string {
  return `./${template.replace('<path>', path)}`.replace(/\\/g, '/').replace(/\/\.\//g, '/');
}

function buildExportEntry(
  exportPath: string,
  conditions: ExportCondition[],
  templates: Required<PopulateExportsTemplates>,
  options: { dcts: boolean; importPath?: string },
): Record<string, string | Record<string, string>> {
  const result: Record<string, string | Record<string, string>> = {};

  // Re-order conditions to spec order.
  const ordered = CONDITION_ORDER.filter((c) => conditions.includes(c));

  for (const cond of ordered) {
    if (cond === 'types' && options.dcts) {
      // Object form: { import: '.d.ts', require: '.d.cts' }
      result.types = {
        import: applyTemplate(templates.types, exportPath),
        require: applyTemplate(templates.typesRequire, exportPath),
      };
    } else if (cond === 'types') {
      result.types = applyTemplate(templates.types, exportPath);
    } else if (cond === 'import' && options.importPath) {
      result.import = applyTemplate(templates.import.replace('<path>', options.importPath), '');
    } else {
      result[cond] = applyTemplate(templates[cond], exportPath);
    }
  }

  return result;
}

function expandEntryPath(entry: string, barrelFileName: string): string {
  // Trailing slash -> barrel directory
  if (entry.endsWith('/')) return `${entry}${barrelFileName}`;
  return entry;
}

function exportSubpath(entry: string): string {
  if (entry === '' || entry === '.') return '.';
  return `./${entry.replace(/\/$/, '')}`;
}

function resolveCdn(
  cdn: FillPackageJsonV2ExecutorSchema['cdn'],
): { unpkg?: string; jsdelivr?: string; browser?: string } {
  if (!cdn) return {};
  if (typeof cdn === 'string') {
    const path = cdn.startsWith('./') || cdn.startsWith('/') ? cdn : `./${cdn}`;
    return { unpkg: path, jsdelivr: path };
  }
  return cdn;
}

const runExecutor: PromiseExecutor<FillPackageJsonV2ExecutorSchema> = async (
  options,
  context: ExecutorContext,
) => {
  const projectName = context.projectName as string;
  const workspaceRoot = context.root;
  const projectRoot = context.projectsConfigurations?.projects?.[projectName]?.root ?? '.';

  const outputPath = isAbsolute(options.outputPath)
    ? options.outputPath
    : resolve(workspaceRoot, options.outputPath);

  const rootPkg = await readJson(resolve(workspaceRoot, 'package.json'));
  const projectPkg = await readJson(resolve(workspaceRoot, projectRoot, 'package.json'));

  if (!rootPkg) {
    console.error('[fill-package-json-v2] could not read root package.json');
    return { success: false };
  }
  if (!projectPkg) {
    console.error(`[fill-package-json-v2] could not read project package.json at ${projectRoot}`);
    return { success: false };
  }

  const merged: Record<string, string> = {
    ...(rootPkg.devDependencies ?? {}),
    ...(rootPkg.dependencies ?? {}),
  };

  // Resolve `*` versions from the root package.json.
  for (const group of ['dependencies', 'peerDependencies', 'devDependencies'] as const) {
    const bag = projectPkg[group];
    if (!bag) continue;
    for (const key of Object.keys(bag)) {
      if (bag[key] !== '*') continue;
      const resolved = merged[key];
      if (!resolved) {
        console.warn(`[fill-package-json-v2] unresolved '*' version for ${key} in ${group}`);
        continue;
      }
      bag[key] = resolved;
    }
  }

  // Inherit common metadata fields from the root package.json.
  for (const key of ['bugs', 'license', 'homepage', 'repository', 'author', 'funding']) {
    if (projectPkg[key] != null) continue;
    if (rootPkg[key] == null) continue;
    projectPkg[key] = rootPkg[key];
  }

  if (options.packageVersion) {
    projectPkg.version = options.packageVersion;
    console.log(`[fill-package-json-v2] version set to ${options.packageVersion}`);
  }

  // sideEffects
  if (options.sideEffects !== undefined) {
    projectPkg.sideEffects = options.sideEffects;
  } else if (projectPkg.sideEffects === undefined) {
    projectPkg.sideEffects = false;
  }

  // populateExports
  if (options.populateExports) {
    const popOpts: PopulateExportsOptions = options.populateExports;
    const conditions = popOpts.exports ?? DEFAULT_EXPORTS;
    const templates: Required<PopulateExportsTemplates> = {
      ...DEFAULT_TEMPLATES,
      ...(popOpts.templates ?? {}),
    };
    const dcts = popOpts.dcts ?? true;
    const barrelFileName = popOpts.barrelFileName ?? 'index';
    const entriesTemplateProperty = popOpts.entriesTemplateProperty ?? '_exports';

    const rawEntries = popOpts.entries ?? (projectPkg[entriesTemplateProperty] as string[] | undefined) ?? [];

    const exportsMap: Record<string, unknown> = {};

    // Root entry '.'
    const rootImportPath =
      popOpts.useFesm ? `fesm/${projectName}.mjs` : undefined;
    exportsMap['.'] = buildExportEntry(barrelFileName, conditions, templates, {
      dcts,
      importPath: rootImportPath,
    });

    for (const entry of rawEntries) {
      const subpath = exportSubpath(entry);
      const path = expandEntryPath(entry, barrelFileName);
      exportsMap[subpath] = buildExportEntry(path, conditions, templates, { dcts });
    }

    projectPkg.exports = {
      ...exportsMap,
      ...(projectPkg.exports ?? {}),
    };

    delete projectPkg[entriesTemplateProperty];
    console.log(`[fill-package-json-v2] populated ${Object.keys(exportsMap).length} export entries`);
  }

  // Top-level fallback fields (legacy bundlers).
  if (options.topLevelFields !== false && projectPkg.exports) {
    const dot = (projectPkg.exports as Record<string, unknown>)['.'] as
      | Record<string, unknown>
      | undefined;
    if (dot && typeof dot === 'object') {
      const importPath = dot.import as string | undefined;
      const requirePath = dot.require as string | undefined;
      const defaultPath = dot.default as string | undefined;
      const types = dot.types;
      const typesPath =
        typeof types === 'string' ? types : (types as { import?: string } | undefined)?.import;

      if (importPath && projectPkg.module == null) projectPkg.module = importPath;
      if (requirePath && projectPkg.main == null) projectPkg.main = requirePath;
      else if (defaultPath && projectPkg.main == null) projectPkg.main = defaultPath;
      if (typesPath && projectPkg.types == null) {
        projectPkg.types = typesPath;
        if (projectPkg.typings == null) projectPkg.typings = typesPath;
      }
    }
  }

  // CDN fields
  const cdn = resolveCdn(options.cdn);
  if (cdn.unpkg) projectPkg.unpkg = cdn.unpkg;
  if (cdn.jsdelivr) projectPkg.jsdelivr = cdn.jsdelivr;
  if (cdn.browser && projectPkg.browser == null) projectPkg.browser = cdn.browser;

  // Write output.
  try {
    await mkdir(outputPath, { recursive: true });
    await writeFile(
      resolve(outputPath, 'package.json'),
      JSON.stringify(projectPkg, null, 2) + '\n',
      'utf-8',
    );
  } catch (err) {
    console.error('[fill-package-json-v2] failed to write package.json:', err);
    return { success: false };
  }

  console.log(`[fill-package-json-v2] wrote ${resolve(outputPath, 'package.json')}`);
  return { success: true };
};

export default runExecutor;
