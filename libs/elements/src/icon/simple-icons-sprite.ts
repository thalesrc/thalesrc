/*
 * Global sprite + loader for the Simple Icons family of `<tp-icon>`.
 *
 * On first sight of a slug we fetch `${baseUrl}/${slug}` (defaults to the
 * official Simple Icons CDN), extract the single `<path>` and the `<title>`
 * from the response, and append a fresh `<symbol id="tp-si-${slug}">` to a
 * single shared `<svg>` sprite that lives at the bottom of `document.body`.
 *
 * Subsequent `<tp-icon family="simple-icons" slug="...">` instances reference
 * the same symbol via `<use href="#tp-si-${slug}"/>` &mdash; no extra requests,
 * no DOM duplication.
 */

const SLUG_PATTERN = /^[a-z0-9.-]+$/;
const SPRITE_MARKER = "data-tp-simple-icons";
const SVG_NS = "http://www.w3.org/2000/svg";

let baseUrl = "https://cdn.simpleicons.org";
let sprite: SVGSVGElement | null = null;
const inFlight = new Map<string, Promise<SimpleIconMeta>>();

export interface SimpleIconMeta {
  /** Human-readable brand title taken from the CDN's `<title>` element. */
  title: string;
}

/**
 * The DOM id used for the `<symbol>` corresponding to a Simple Icons slug.
 * Exposed so `<tp-icon>` and tests can build matching `<use href>` references.
 */
export function getSimpleIconSymbolId(slug: string): string {
  return `tp-si-${slug}`;
}

/**
 * Override the CDN base URL used by the loader. Useful for self-hosting,
 * offline development, or pointing at a regional mirror. Trailing slashes
 * are stripped.
 *
 * @example
 * ```ts
 * setSimpleIconsBaseUrl("/assets/simple-icons");
 * ```
 */
export function setSimpleIconsBaseUrl(url: string): void {
  baseUrl = url.replace(/\/+$/, "");
}

/**
 * Drop every cached symbol and remove the sprite from the DOM. Intended for
 * test isolation; production code rarely needs to call this.
 */
export function clearSimpleIconsCache(): void {
  inFlight.clear();
  if (sprite && sprite.parentNode) {
    sprite.parentNode.removeChild(sprite);
  }
  sprite = null;
}

/**
 * Ensure a `<symbol id="tp-si-${slug}">` exists in the global sprite. Returns
 * a promise that resolves once the symbol is in the DOM (or immediately if
 * it was already loaded). Safe to call repeatedly with the same slug.
 *
 * Throws synchronously for slugs that don't match the Simple Icons slug
 * grammar (`/^[a-z0-9.-]+$/`).
 */
export function loadSimpleIcon(slug: string): Promise<SimpleIconMeta> {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`[tp-icon] Invalid Simple Icons slug: ${JSON.stringify(slug)}`);
  }

  const cached = inFlight.get(slug);
  if (cached) return cached;

  const promise = (async (): Promise<SimpleIconMeta> => {
    const res = await fetch(`${baseUrl}/${slug}`);
    if (!res.ok) {
      throw new Error(`[tp-icon] Failed to load Simple Icons slug "${slug}": ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    if (doc.querySelector("parsererror")) {
      throw new Error(`[tp-icon] Failed to parse SVG for slug "${slug}"`);
    }

    const path = doc.querySelector("path");
    if (!path) {
      throw new Error(`[tp-icon] No <path> found in SVG for slug "${slug}"`);
    }

    const title = doc.querySelector("title")?.textContent?.trim() ?? slug;

    const target = ensureSprite();
    const symbol = document.createElementNS(SVG_NS, "symbol");
    symbol.setAttribute("id", getSimpleIconSymbolId(slug));
    symbol.setAttribute("viewBox", "0 0 24 24");

    const titleEl = document.createElementNS(SVG_NS, "title");
    titleEl.textContent = title;
    symbol.appendChild(titleEl);

    const cleanedPath = document.createElementNS(SVG_NS, "path");
    cleanedPath.setAttribute("d", path.getAttribute("d") ?? "");
    symbol.appendChild(cleanedPath);

    target.appendChild(symbol);

    return { title };
  })();

  // On failure, evict so a later retry can succeed.
  promise.catch(() => {
    if (inFlight.get(slug) === promise) inFlight.delete(slug);
  });

  inFlight.set(slug, promise);
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
