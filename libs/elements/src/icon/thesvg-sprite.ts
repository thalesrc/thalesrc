/*
 * Global sprite + loader for the theSVG family of `<tp-icon>`.
 *
 * On first sight of a `(slug, variant)` pair we fetch
 * `${baseUrl}/${slug}/${variant}.svg` (defaults to the GLINCKER theSVG
 * jsDelivr mirror), clone the entire SVG body into a fresh
 * `<symbol id="tp-thesvg-${slug}-${variant}">`, namespace any internal `id`
 * attributes (and the `url(#…)` / `href="#…"` references that point at them)
 * so multiple icons can coexist in the shared sprite without colliding, and
 * append the symbol to a single `<svg data-tp-thesvg>` at the bottom of
 * `document.body`.
 *
 * Subsequent `<tp-icon family="thesvg" slug="…" variant="…">` instances
 * reference the same symbol via `<use href="#tp-thesvg-${slug}-${variant}"/>`.
 */

const SLUG_PATTERN = /^[a-z0-9.-]+$/;
const VARIANT_PATTERN = /^[a-z0-9-]+$/;
const SPRITE_MARKER = "data-tp-thesvg";
const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

let baseUrl = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";
let sprite: SVGSVGElement | null = null;
const inFlight = new Map<string, Promise<TheSvgMeta>>();

export interface TheSvgMeta {
  /** Slug requested. */
  slug: string;
  /** Variant requested (defaults to `"default"`). */
  variant: string;
  /** `viewBox` copied from the source SVG (falls back to `"0 0 24 24"`). */
  viewBox: string;
}

/**
 * The DOM id used for the `<symbol>` corresponding to a given theSVG
 * `(slug, variant)` pair. Exposed so `<tp-icon>` and tests can build matching
 * `<use href>` references.
 */
export function getTheSvgSymbolId(slug: string, variant: string = "default"): string {
  return `tp-thesvg-${slug}-${variant}`;
}

/**
 * Override the CDN base URL used by the loader. Useful for self-hosting,
 * offline development, or pointing at the canonical site
 * (`https://thesvg.org/icons`). Trailing slashes are stripped.
 */
export function setTheSvgBaseUrl(url: string): void {
  baseUrl = url.replace(/\/+$/, "");
}

/**
 * Drop every cached symbol and remove the sprite from the DOM. Intended for
 * test isolation; production code rarely needs to call this.
 */
export function clearTheSvgCache(): void {
  inFlight.clear();
  if (sprite && sprite.parentNode) {
    sprite.parentNode.removeChild(sprite);
  }
  sprite = null;
}

/**
 * Inspect which variants of `slug` are currently materialised in the sprite.
 * Reads from the DOM only &mdash; does not hit the network and does not list
 * variants that exist on the CDN but haven't been requested yet.
 */
export function listLoadedTheSvgVariants(slug: string): string[] {
  if (!SLUG_PATTERN.test(slug)) return [];
  if (!sprite) return [];
  const prefix = `tp-thesvg-${slug}-`;
  const out: string[] = [];
  for (const symbol of Array.from(
    sprite.querySelectorAll<SVGSymbolElement>("symbol"),
  )) {
    const id = symbol.getAttribute("id");
    if (id && id.startsWith(prefix)) out.push(id.slice(prefix.length));
  }
  return out;
}

/**
 * Ensure a `<symbol id="tp-thesvg-${slug}-${variant}">` exists in the global
 * sprite. Returns a promise that resolves once the symbol is in the DOM (or
 * immediately if it was already loaded). Safe to call repeatedly with the
 * same `(slug, variant)` pair.
 *
 * Throws synchronously when either argument fails its whitelist
 * (`slug`: `/^[a-z0-9.-]+$/`, `variant`: `/^[a-z0-9-]+$/`).
 */
export function loadTheSvgIcon(slug: string, variant: string = "default"): Promise<TheSvgMeta> {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`[tp-icon] Invalid theSVG slug: ${JSON.stringify(slug)}`);
  }
  if (!VARIANT_PATTERN.test(variant)) {
    throw new Error(`[tp-icon] Invalid theSVG variant: ${JSON.stringify(variant)}`);
  }

  const key = `${slug}/${variant}`;
  const cached = inFlight.get(key);
  if (cached) return cached;

  const promise = (async (): Promise<TheSvgMeta> => {
    const res = await fetch(`${baseUrl}/${slug}/${variant}.svg`);
    if (!res.ok) {
      throw new Error(
        `[tp-icon] Failed to load theSVG "${slug}/${variant}": ${res.status} ${res.statusText}`,
      );
    }

    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    if (doc.querySelector("parsererror")) {
      throw new Error(`[tp-icon] Failed to parse SVG for "${slug}/${variant}"`);
    }

    const root = doc.documentElement as unknown as SVGSVGElement;
    if (!root || root.nodeName.toLowerCase() !== "svg") {
      throw new Error(`[tp-icon] No <svg> root in response for "${slug}/${variant}"`);
    }

    const viewBox = root.getAttribute("viewBox") ?? "0 0 24 24";
    const symbolId = getTheSvgSymbolId(slug, variant);

    const target = ensureSprite();
    const symbol = document.createElementNS(SVG_NS, "symbol");
    symbol.setAttribute("id", symbolId);
    symbol.setAttribute("viewBox", viewBox);

    // Import children first so we own the cloned nodes, then namespace ids
    // and rewrite intra-document references to those ids.
    for (const child of Array.from(root.childNodes)) {
      symbol.appendChild(document.importNode(child, true));
    }
    namespaceIds(symbol, symbolId);

    target.appendChild(symbol);

    return { slug, variant, viewBox };
  })();

  // On failure, evict so a later retry can succeed.
  promise.catch(() => {
    if (inFlight.get(key) === promise) inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
}

function ensureSprite(): SVGSVGElement {
  if (sprite && sprite.isConnected) return sprite;

  // Survive HMR / multiple module instances: reuse an existing tagged sprite.
  const existing = document.querySelector<SVGSVGElement>(`svg[${SPRITE_MARKER}]`);
  if (existing) {
    sprite = existing;
    return sprite;
  }

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute(SPRITE_MARKER, "");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("xmlns", SVG_NS);
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.style.overflow = "hidden";
  document.body.appendChild(svg);

  sprite = svg;
  return svg;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Walk `root` twice: first collect every `id` attribute and rename it to
 * `${prefix}-${id}`, then rewrite every reference to those ids. References
 * appear in two shapes:
 *   - URL functional notation: `url(#a)` / `url("#a")` / `url('#a')` inside
 *     any attribute value (commonly `fill`, `stroke`, `filter`, `mask`,
 *     `clip-path`).
 *   - Hash references: `href="#a"` and the legacy `xlink:href="#a"`.
 */
function namespaceIds(root: Element, prefix: string): void {
  const renames = new Map<string, string>();
  // Skip `root` itself; only namespace ids on its descendants. The symbol
  // element keeps its outer id (`prefix`).
  for (const child of Array.from(root.children)) {
    walk(child, (el) => {
      const id = el.getAttribute("id");
      if (id) {
        const next = `${prefix}-${id}`;
        el.setAttribute("id", next);
        renames.set(id, next);
      }
    });
  }

  if (renames.size === 0) return;

  // Build one regex per old id to rewrite `url(#oldId)` references inside any
  // attribute value (handles bare/quoted forms).
  const urlPatterns: Array<{ regex: RegExp; replacement: string }> = [];
  for (const [oldId, newId] of renames) {
    urlPatterns.push({
      regex: new RegExp(`url\\((["']?)#${escapeRegExp(oldId)}\\1\\)`, "g"),
      replacement: `url($1#${newId}$1)`,
    });
  }

  for (const child of Array.from(root.children)) {
    walk(child, (el) => {
      for (const attr of Array.from(el.attributes)) {
        // Skip the `id` attribute itself; we already renamed it above.
        if (attr.name === "id") continue;

        let value = attr.value;
        let changed = false;

        // url(#…) references in any attribute (fill, stroke, filter, …).
        if (value.includes("url(")) {
          for (const { regex, replacement } of urlPatterns) {
            const next = value.replace(regex, replacement);
            if (next !== value) {
              value = next;
              changed = true;
            }
          }
        }

        // Hash references: href / xlink:href.
        const isHrefAttr =
          attr.name === "href" ||
          attr.name === "xlink:href" ||
          (attr.namespaceURI === XLINK_NS && attr.localName === "href");
        if (isHrefAttr && value.startsWith("#")) {
          const target = value.slice(1);
          const renamed = renames.get(target);
          if (renamed) {
            value = `#${renamed}`;
            changed = true;
          }
        }

        if (changed) attr.value = value;
      }
    });
  }
}

function walk(root: Element, visit: (el: Element) => void): void {
  visit(root);
  for (const child of Array.from(root.children)) walk(child, visit);
}
