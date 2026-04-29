/**
 * Cache wrappers for ESM-only modules that need to be loaded from a CommonJS
 * executor via dynamic `import()`. Cached per-specifier so the dynamic import
 * cost is paid once per process.
 */

const cache = new Map<string, unknown>();

/**
 * Dynamically import an ESM-only module and pick a named (or default) export.
 * Result is cached by specifier; subsequent calls are synchronous after the
 * first resolution.
 */
export async function loadEsmOnly<T>(
  specifier: string,
  pickExport: (mod: Record<string, unknown>) => T,
): Promise<T> {
  const cached = cache.get(specifier);
  if (cached !== undefined) return cached as T;
  const mod = (await import(specifier)) as Record<string, unknown>;
  const picked = pickExport(mod);
  cache.set(specifier, picked);
  return picked;
}
