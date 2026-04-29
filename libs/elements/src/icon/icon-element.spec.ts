import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IconElement } from "./icon-element";
import {
  clearSimpleIconsCache,
  getSimpleIconSymbolId,
  setSimpleIconsBaseUrl,
} from "./simple-icons-sprite";

const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <title>Facebook</title>
  <path d="M12 0C5 0 0 5 0 12z" />
</svg>`;

function okResponse(text = SAMPLE_SVG): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

function notFoundResponse(): Response {
  return {
    ok: false,
    status: 404,
    statusText: "Not Found",
    text: () => Promise.resolve(""),
  } as unknown as Response;
}

async function nextLoadEvent(el: IconElement): Promise<CustomEvent> {
  return new Promise((resolve, reject) => {
    el.addEventListener("tp-icon-load", (event) => resolve(event as CustomEvent), { once: true });
    el.addEventListener(
      "tp-icon-error",
      (event) => reject((event as CustomEvent).detail.error),
      { once: true },
    );
  });
}

async function nextErrorEvent(el: IconElement): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener("tp-icon-error", (event) => resolve(event as CustomEvent), { once: true });
  });
}

describe("<tp-icon> simple-icons family", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setSimpleIconsBaseUrl("https://cdn.simpleicons.org");
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    clearSimpleIconsCache();
    fetchSpy.mockRestore();
    document.body.innerHTML = "";
  });

  it("registers the custom element", () => {
    expect(customElements.get("tp-icon")).toBe(IconElement);
  });

  it("injects a <use> reference and fires tp-icon-load", async () => {
    fetchSpy.mockResolvedValueOnce(okResponse());

    const el = document.createElement("tp-icon");
    el.setAttribute("family", "simple-icons");
    el.setAttribute("slug", "facebook");
    document.body.appendChild(el);

    const event = await nextLoadEvent(el);

    expect(event.detail).toMatchObject({ slug: "facebook", title: "Facebook" });
    const use = el.querySelector("use");
    expect(use?.getAttribute("href")).toBe(`#${getSimpleIconSymbolId("facebook")}`);
  });

  it("auto-applies aria-label from the CDN <title> when none is set", async () => {
    fetchSpy.mockResolvedValueOnce(okResponse());

    const el = document.createElement("tp-icon");
    el.setAttribute("family", "simple-icons");
    el.setAttribute("slug", "facebook");
    document.body.appendChild(el);

    await nextLoadEvent(el);

    expect(el.getAttribute("aria-label")).toBe("Facebook");
  });

  it("preserves an explicit aria-label", async () => {
    fetchSpy.mockResolvedValueOnce(okResponse());

    const el = document.createElement("tp-icon");
    el.setAttribute("aria-label", "Like us on Facebook");
    el.setAttribute("family", "simple-icons");
    el.setAttribute("slug", "facebook");
    document.body.appendChild(el);

    await nextLoadEvent(el);

    expect(el.getAttribute("aria-label")).toBe("Like us on Facebook");
  });

  it("flips errored=true and dispatches tp-icon-error on a failed fetch", async () => {
    fetchSpy.mockResolvedValueOnce(notFoundResponse());

    const el = document.createElement("tp-icon");
    el.setAttribute("family", "simple-icons");
    el.setAttribute("slug", "nope");
    document.body.appendChild(el);

    const event = await nextErrorEvent(el);

    expect(event.detail.slug).toBe("nope");
    expect(el.errored).toBe(true);
    expect(el.loading).toBe(false);
    expect(el.querySelector("svg")).toBeNull();
  });

  it("ignores stale resolutions when the slug changes mid-flight", async () => {
    let resolveFirst!: (r: Response) => void;
    fetchSpy.mockImplementationOnce(
      () => new Promise<Response>((resolve) => { resolveFirst = resolve; }),
    );
    fetchSpy.mockResolvedValueOnce(okResponse(SAMPLE_SVG.replace("Facebook", "GitHub")));

    const el = document.createElement("tp-icon");
    el.setAttribute("family", "simple-icons");
    el.setAttribute("slug", "facebook");
    document.body.appendChild(el);
    await el.updateComplete;

    el.setAttribute("slug", "github");
    const second = nextLoadEvent(el);

    // Resolve the first request after the second was issued.
    resolveFirst(okResponse());

    const event = await second;

    expect(event.detail.slug).toBe("github");
    expect(el.querySelector("use")?.getAttribute("href")).toBe(`#${getSimpleIconSymbolId("github")}`);
    expect(el.getAttribute("aria-label")).toBe("GitHub");
  });

  it("clears injected children when family switches away from simple-icons", async () => {
    fetchSpy.mockResolvedValueOnce(okResponse());

    const el = document.createElement("tp-icon");
    el.setAttribute("family", "simple-icons");
    el.setAttribute("slug", "facebook");
    document.body.appendChild(el);
    await nextLoadEvent(el);

    el.setAttribute("family", "material");
    await el.updateComplete;

    expect(el.querySelector("svg")).toBeNull();
  });
});
