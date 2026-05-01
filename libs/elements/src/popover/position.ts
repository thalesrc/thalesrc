/**
 * Positioning utilities for `tp-popover`.
 *
 * The element's `position` attribute is a small DSL describing where the
 * popover edge attaches to the anchor edge on each axis. This module owns
 * the parsing of that DSL into a normalised {@link ParsedPosition}.
 */

export type InlinePos = "start" | "center" | "end";
export type BlockPos = "top" | "middle" | "bottom";

export interface ParsedPosition {
  popInline: InlinePos;
  targetInline: InlinePos;
  popBlock: BlockPos;
  targetBlock: BlockPos;
}

export const DEFAULT_POSITION: ParsedPosition = {
  popInline: "center",
  targetInline: "center",
  popBlock: "bottom",
  targetBlock: "top",
};

const INLINE_KEYWORDS: ReadonlySet<string> = new Set(["start", "center", "end"]);
const BLOCK_KEYWORDS: ReadonlySet<string> = new Set(["top", "middle", "bottom"]);

/** Inline shorthand → `<pop-inline> to <target-inline>`. */
const INLINE_SHORTHAND: Record<InlinePos, [InlinePos, InlinePos]> = {
  start: ["end", "start"],
  center: ["center", "center"],
  end: ["start", "end"],
};

/** Block shorthand → `<pop-block> to <target-block>`. */
const BLOCK_SHORTHAND: Record<BlockPos, [BlockPos, BlockPos]> = {
  top: ["bottom", "top"],
  middle: ["middle", "middle"],
  bottom: ["top", "bottom"],
};

function parseInlineHalf(raw: string): [InlinePos, InlinePos] | null {
  const parts = raw.trim().split(/\s+to\s+/);
  if (parts.length === 1) {
    const k = parts[0];
    return INLINE_KEYWORDS.has(k) ? INLINE_SHORTHAND[k as InlinePos] : null;
  }
  if (parts.length === 2 && INLINE_KEYWORDS.has(parts[0]) && INLINE_KEYWORDS.has(parts[1])) {
    return [parts[0] as InlinePos, parts[1] as InlinePos];
  }
  return null;
}

function parseBlockHalf(raw: string): [BlockPos, BlockPos] | null {
  const parts = raw.trim().split(/\s+to\s+/);
  if (parts.length === 1) {
    const k = parts[0];
    return BLOCK_KEYWORDS.has(k) ? BLOCK_SHORTHAND[k as BlockPos] : null;
  }
  if (parts.length === 2 && BLOCK_KEYWORDS.has(parts[0]) && BLOCK_KEYWORDS.has(parts[1])) {
    return [parts[0] as BlockPos, parts[1] as BlockPos];
  }
  return null;
}

/**
 * Parse a `position` attribute value. Supported forms:
 *
 * - Full: `"<pop-inline> to <target-inline> / <pop-block> to <target-block>"`
 * - Two-keyword: `"<inline> / <block>"` (each half may also be the full
 *   `"a to b"` form). E.g. `"center / top"` → `"center to center / bottom to top"`.
 * - Single axis: one half only (no `/`) — either `"<a> to <b>"` or a single
 *   keyword. The other axis defaults to its centered/middle form. E.g.
 *   `"top to bottom"` → `"center to center / top to bottom"`,
 *   `"start to center"` → `"start to center / middle to middle"`,
 *   `"start"` → `"end to start / middle to middle"`.
 *
 * Returns `null` for invalid input so callers can warn and fall back.
 */
export function parsePosition(raw: string | null | undefined): ParsedPosition | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  // Single axis (no `/`): either a single keyword or `"<a> to <b>"`.
  if (!trimmed.includes("/")) {
    const inline = parseInlineHalf(trimmed);
    if (inline) {
      const [popBlock, targetBlock] = BLOCK_SHORTHAND.middle;
      return { popInline: inline[0], targetInline: inline[1], popBlock, targetBlock };
    }
    const block = parseBlockHalf(trimmed);
    if (block) {
      const [popInline, targetInline] = INLINE_SHORTHAND.center;
      return { popInline, targetInline, popBlock: block[0], targetBlock: block[1] };
    }
    return null;
  }

  const halves = trimmed.split("/");
  if (halves.length !== 2) return null;

  const inline = parseInlineHalf(halves[0]);
  const block = parseBlockHalf(halves[1]);
  if (!inline || !block) return null;

  return {
    popInline: inline[0],
    targetInline: inline[1],
    popBlock: block[0],
    targetBlock: block[1],
  };
}
