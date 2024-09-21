import { existsSync } from "fs";
import { mkdir } from "fs/promises";

export async function ensureDirectory(path: string) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}
