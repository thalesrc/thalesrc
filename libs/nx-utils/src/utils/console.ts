/**
 * Console output helpers for executors.
 *
 * - {@link symbols} returns Unicode glyphs on TTYs that can render them and ASCII
 *   fallbacks on Windows consoles whose code page isn't UTF-8 (avoids the
 *   `Γ£ô`/`Γ£ù` mojibake that otherwise pollutes the build log).
 * - {@link formatBuildError} emits a one-line, IDE-friendly representation of a
 *   Rollup or general error with file:line:col prefix when available.
 */

interface Symbols {
  ok: string;
  fail: string;
  warn: string;
  info: string;
}

let cachedSymbols: Symbols | null = null;

export function symbols(): Symbols {
  if (cachedSymbols) return cachedSymbols;
  cachedSymbols = canRenderUnicode()
    ? { ok: '✓', fail: '✗', warn: '⚠', info: 'ℹ' }
    : { ok: '[OK]', fail: '[FAIL]', warn: '[WARN]', info: '[INFO]' };
  return cachedSymbols;
}

function canRenderUnicode(): boolean {
  // Honor explicit overrides used by CI logs that strip ANSI/Unicode.
  if (process.env.FORCE_ASCII === '1' || process.env.NO_UNICODE === '1') return false;
  if (process.env.FORCE_UNICODE === '1') return true;
  if (process.platform !== 'win32') return true;
  // On Windows, a UTF-8 code page (65001) lets the default Win32 console render
  // glyphs correctly. PowerShell 7 and Windows Terminal both report this.
  const cp = process.env.OutputEncoding ?? '';
  if (cp.toLowerCase().includes('utf')) return true;
  // Windows Terminal sets WT_SESSION; modern Windows Terminal handles UTF-8
  // regardless of the process code page.
  if (process.env.WT_SESSION) return true;
  return false;
}

interface NormalizedErrorParts {
  loc?: string;
  message: string;
  plugin?: string;
  frame?: string;
}

interface RollupLikeError {
  message?: string;
  loc?: { file?: string; line?: number; column?: number };
  id?: string;
  plugin?: string;
  frame?: string;
}

function normalizeError(err: unknown): NormalizedErrorParts {
  if (err == null) return { message: String(err) };
  const e = err as RollupLikeError;
  const fileRaw = e.loc?.file ?? e.id;
  const line = e.loc?.line;
  const col = e.loc?.column;
  let loc: string | undefined;
  if (fileRaw && line != null) {
    loc = col != null ? `${fileRaw}:${line}:${col}` : `${fileRaw}:${line}`;
  } else if (fileRaw) {
    loc = fileRaw;
  }
  const message = typeof e.message === 'string' ? e.message : String(err);
  return { loc, message, plugin: e.plugin, frame: e.frame };
}

/**
 * Format an error for single-line console output. Prepends the (optional) file
 * location and appends `[plugin]` when present so that editors can jump to the
 * source.
 */
export function formatBuildError(prefix: string, err: unknown): string {
  const { loc, message, plugin, frame } = normalizeError(err);
  const head = loc ? `${prefix} ${loc} ${message}` : `${prefix} ${message}`;
  const tail = plugin ? ` [${plugin}]` : '';
  return frame ? `${head}${tail}\n${frame}` : `${head}${tail}`;
}
