import { readFile } from 'node:fs/promises';

/**
 * Read and parse a JSON file. Returns null when the file cannot be read or
 * does not contain valid JSON. Shared helper for executors that read project
 * package.json, root package.json, and tsconfig.json files.
 */
export async function readJson<T = unknown>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}
