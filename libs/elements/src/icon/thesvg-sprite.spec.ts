import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearTheSvgCache,
  getTheSvgSymbolId,
  listLoadedTheSvgVariants,
  loadTheSvgIcon,
  setTheSvgBaseUrl,
} from "./thesvg-sprite";

const DEFAULT_BASE_URL =
  "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

const GOOGLE_DEFAULT = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4285F4" />
      <stop offset="1" stop-color="#34A853" />
    </linearGradient>
  </defs>
  <path id="g" fill="url(#a)" d="M24 4l20 20-20 20L4 24z" />
  <use xlink:href="#g" transform="translate(2 2)" />
</svg>`;

const GOOGLE_MONO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M0 0h24v24H0z" />
</svg>`;

const MICROSOFT_DEFAULT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><linearGradient id="a"><stop offset="0" stop-color="#F25022" /></linearGradient></defs>
  <rect fill="url(#a)" width="14" height="14" />
</svg>`;

function ok(text: string): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

function notFound(): Response {
  return {
    ok: false,
    status: 404,
    statusText: "Not Found",
    text: () => Promise.resolve(""),
  } as unknown as Response;
}

describe("thesvg-sprite", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setTheSvgBaseUrl(DEFAULT_BASE_URL);
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    clearTheSvgCache();
    fetchSpy.mockRestore();
  });

  it("creates the global sprite on first load and copies viewBox", async () => {
    fetchSpy.mockResolvedValueOnce(ok(GOOGLE_DEFAULT));

    const meta = await loadTheSvgIcon("google");

    expect(meta).toMatchObject({ slug: "google", variant: "default", viewBox: "0 0 48 48" });
    const sprite = document.querySelector("svg[data-tp-thesvg]");
    expect(sprite).not.toBeNull();
    const symbol = sprite!.querySelector(`#${getTheSvgSymbolId("google", "default")}`);
    expect(symbol).not.toBeNull();
    expect(symbol!.getAttribute("viewBox")).toBe("0 0 48 48");
  });

  it("namespaces internal ids and rewrites url(#…) and xlink:href references", async () => {
    fetchSpy.mockResolvedValueOnce(ok(GOOGLE_DEFAULT));

    await loadTheSvgIcon("google");

    const symbolId = getTheSvgSymbolId("google", "default");
    const sprite = document.querySelector("svg[data-tp-thesvg]")!;
    const symbol = sprite.querySelector(`#${symbolId}`)!;

    // Original ids `a` and `g` should now be namespaced.
    expect(symbol.querySelector(`#${symbolId}-a`)).not.toBeNull();
    expect(symbol.querySelector(`#${symbolId}-g`)).not.toBeNull();
    expect(symbol.querySelector("#a")).toBeNull();
    expect(symbol.querySelector("#g")).toBeNull();

    const path = symbol.querySelector("path")!;
    expect(path.getAttribute("fill")).toBe(`url(#${symbolId}-a)`);

    const useEl = symbol.querySelector("use")!;
    const xlink =
      useEl.getAttributeNS("http://www.w3.org/1999/xlink", "href") ??
      useEl.getAttribute("xlink:href");
    expect(xlink).toBe(`#${symbolId}-g`);
  });

  it("dedupes concurrent requests for the same (slug, variant)", async () => {
    fetchSpy.mockResolvedValueOnce(ok(GOOGLE_DEFAULT));

    const [a, b] = await Promise.all([loadTheSvgIcon("google"), loadTheSvgIcon("google")]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(a.viewBox).toBe(b.viewBox);
  });

  it("loads distinct variants of the same slug independently", async () => {
    fetchSpy
      .mockResolvedValueOnce(ok(GOOGLE_DEFAULT))
      .mockResolvedValueOnce(ok(GOOGLE_MONO));

    await loadTheSvgIcon("google", "default");
    await loadTheSvgIcon("google", "mono");

    const sprite = document.querySelector("svg[data-tp-thesvg]")!;
    expect(sprite.querySelectorAll("symbol")).toHaveLength(2);
    expect(sprite.querySelector(`#${getTheSvgSymbolId("google", "default")}`)).not.toBeNull();
    expect(sprite.querySelector(`#${getTheSvgSymbolId("google", "mono")}`)).not.toBeNull();
  });

  it("namespaces ids per (slug, variant) so two icons can coexist", async () => {
    fetchSpy
      .mockResolvedValueOnce(ok(GOOGLE_DEFAULT))
      .mockResolvedValueOnce(ok(MICROSOFT_DEFAULT));

    await loadTheSvgIcon("google");
    await loadTheSvgIcon("microsoft");

    const sprite = document.querySelector("svg[data-tp-thesvg]")!;
    expect(sprite.querySelector(`#${getTheSvgSymbolId("google", "default")}-a`)).not.toBeNull();
    expect(sprite.querySelector(`#${getTheSvgSymbolId("microsoft", "default")}-a`)).not.toBeNull();
    // Original colliding `id="a"` must no longer be present in either symbol.
    expect(sprite.querySelectorAll("[id='a']")).toHaveLength(0);
  });

  it("throws synchronously on invalid slug", () => {
    expect(() => loadTheSvgIcon("Bad Slug!")).toThrow(/Invalid theSVG slug/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws synchronously on invalid variant", () => {
    expect(() => loadTheSvgIcon("google", "Mono!")).toThrow(/Invalid theSVG variant/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects on a non-2xx response and clears the cache so retries can succeed", async () => {
    fetchSpy.mockResolvedValueOnce(notFound());

    await expect(loadTheSvgIcon("missing")).rejects.toThrow(/404/);

    fetchSpy.mockResolvedValueOnce(ok(GOOGLE_DEFAULT));
    const meta = await loadTheSvgIcon("missing");
    expect(meta.slug).toBe("missing");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("uses the configured base URL", async () => {
    setTheSvgBaseUrl("/local/icons/");
    fetchSpy.mockResolvedValueOnce(ok(GOOGLE_DEFAULT));

    await loadTheSvgIcon("google", "mono");

    expect(fetchSpy).toHaveBeenCalledWith("/local/icons/google/mono.svg");
  });

  it("listLoadedTheSvgVariants returns the variants currently in the sprite", async () => {
    fetchSpy
      .mockResolvedValueOnce(ok(GOOGLE_DEFAULT))
      .mockResolvedValueOnce(ok(GOOGLE_MONO));

    expect(listLoadedTheSvgVariants("google")).toEqual([]);

    await loadTheSvgIcon("google", "default");
    await loadTheSvgIcon("google", "mono");

    expect(listLoadedTheSvgVariants("google").sort()).toEqual(["default", "mono"]);
  });
});
