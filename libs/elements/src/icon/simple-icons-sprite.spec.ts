import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSimpleIconsCache,
  getSimpleIconSymbolId,
  loadSimpleIcon,
  setSimpleIconsBaseUrl,
} from "./simple-icons-sprite";

const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <title>Facebook</title>
  <path d="M12 0C5 0 0 5 0 12z" />
</svg>`;

function mockOk(text = SAMPLE_SVG): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

function mockNotFound(): Response {
  return {
    ok: false,
    status: 404,
    statusText: "Not Found",
    text: () => Promise.resolve(""),
  } as unknown as Response;
}

describe("simple-icons-sprite", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setSimpleIconsBaseUrl("https://cdn.simpleicons.org");
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    clearSimpleIconsCache();
    fetchSpy.mockRestore();
  });

  it("creates the global sprite on first load and appends a <symbol>", async () => {
    fetchSpy.mockResolvedValueOnce(mockOk());

    const meta = await loadSimpleIcon("facebook");

    expect(meta.title).toBe("Facebook");
    const sprite = document.querySelector("svg[data-tp-simple-icons]");
    expect(sprite).not.toBeNull();
    expect(sprite!.querySelector(`#${getSimpleIconSymbolId("facebook")}`)).not.toBeNull();
  });

  it("dedupes concurrent requests for the same slug", async () => {
    fetchSpy.mockResolvedValueOnce(mockOk());

    const [a, b] = await Promise.all([loadSimpleIcon("facebook"), loadSimpleIcon("facebook")]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(a.title).toBe("Facebook");
    expect(b.title).toBe("Facebook");
  });

  it("does not re-fetch a slug that is already cached", async () => {
    fetchSpy.mockResolvedValueOnce(mockOk());
    await loadSimpleIcon("facebook");

    await loadSimpleIcon("facebook");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("creates one symbol per distinct slug", async () => {
    fetchSpy.mockResolvedValueOnce(mockOk()).mockResolvedValueOnce(
      mockOk(SAMPLE_SVG.replace("Facebook", "GitHub")),
    );

    await loadSimpleIcon("facebook");
    await loadSimpleIcon("github");

    const sprite = document.querySelector("svg[data-tp-simple-icons]")!;
    expect(sprite.querySelectorAll("symbol")).toHaveLength(2);
  });

  it("throws synchronously for an invalid slug", () => {
    expect(() => loadSimpleIcon("Bad Slug!")).toThrow(/Invalid Simple Icons slug/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects on a non-2xx response and clears the cache so retries can succeed", async () => {
    fetchSpy.mockResolvedValueOnce(mockNotFound());

    await expect(loadSimpleIcon("nope")).rejects.toThrow(/404/);

    fetchSpy.mockResolvedValueOnce(mockOk(SAMPLE_SVG.replace("Facebook", "Nope")));
    const meta = await loadSimpleIcon("nope");
    expect(meta.title).toBe("Nope");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("uses the configured base URL", async () => {
    setSimpleIconsBaseUrl("/local/icons/");
    fetchSpy.mockResolvedValueOnce(mockOk());

    await loadSimpleIcon("facebook");

    expect(fetchSpy).toHaveBeenCalledWith("/local/icons/facebook");
  });

  it("rejects when the response contains no <path>", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockOk(`<svg xmlns="http://www.w3.org/2000/svg"><title>Empty</title></svg>`),
    );

    await expect(loadSimpleIcon("empty")).rejects.toThrow(/No <path>/);
  });
});
