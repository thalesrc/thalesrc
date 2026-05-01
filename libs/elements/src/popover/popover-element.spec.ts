import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PopoverElement } from "./popover-element";

// Polyfill the few HTMLElement bits jsdom doesn't implement so that the
// element's defensive try/catch blocks can be observed by spies in tests.
const proto = HTMLElement.prototype as unknown as {
  togglePopover?: () => boolean;
  showPopover?: () => void;
  hidePopover?: () => void;
};
proto.togglePopover ??= function (): boolean {
  return true;
};
proto.showPopover ??= function (): void {
  /* noop */
};
proto.hidePopover ??= function (): void {
  /* noop */
};

describe("<tp-popover>", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("registers the custom element", () => {
    expect(customElements.get("tp-popover")).toBe(PopoverElement);
  });

  it("auto-applies the native popover attribute (auto by default)", async () => {
    document.body.innerHTML = `<div><tp-popover></tp-popover></div>`;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.getAttribute("popover")).toBe("auto");
  });

  it("respects mode='manual'", async () => {
    document.body.innerHTML = `<div><tp-popover mode="manual"></tp-popover></div>`;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.getAttribute("popover")).toBe("manual");
  });

  it("falls back to parentElement when target is missing", async () => {
    document.body.innerHTML = `<div id="parent"><tp-popover></tp-popover></div>`;
    const parent = document.getElementById("parent") as HTMLElement;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.anchorElement).toBe(parent);
    expect(pop.anchorName).toMatch(/^--tp-popover-\d+$/);
  });

  it("resolves target via querySelector", async () => {
    document.body.innerHTML = `
      <button id="trigger">x</button>
      <div><tp-popover target="#trigger"></tp-popover></div>
    `;
    const trigger = document.getElementById("trigger") as HTMLElement;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.anchorElement).toBe(trigger);
  });

  it("falls back to parent when target selector does not match", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    document.body.innerHTML = `<div id="parent"><tp-popover target="#nope"></tp-popover></div>`;
    const parent = document.getElementById("parent") as HTMLElement;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.anchorElement).toBe(parent);
    expect(warn).toHaveBeenCalled();
  });

  it("parses position into data-attributes (default)", async () => {
    document.body.innerHTML = `<div><tp-popover></tp-popover></div>`;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.dataset["pi"]).toBe("center");
    expect(pop.dataset["ti"]).toBe("center");
    expect(pop.dataset["pb"]).toBe("bottom");
    expect(pop.dataset["tb"]).toBe("top");
  });

  it("parses a custom position", async () => {
    document.body.innerHTML = `
      <div><tp-popover position="start to end / top to middle"></tp-popover></div>
    `;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.dataset["pi"]).toBe("start");
    expect(pop.dataset["ti"]).toBe("end");
    expect(pop.dataset["pb"]).toBe("top");
    expect(pop.dataset["tb"]).toBe("middle");
  });

  it.each([
    ["center / top", { pi: "center", ti: "center", pb: "bottom", tb: "top" }],
    ["end / bottom", { pi: "start", ti: "end", pb: "top", tb: "bottom" }],
    ["start / middle", { pi: "end", ti: "start", pb: "middle", tb: "middle" }],
    ["center / top to bottom", { pi: "center", ti: "center", pb: "top", tb: "bottom" }],
  ])("parses two-keyword shorthand %s", async (position, expected) => {
    document.body.innerHTML = `<div><tp-popover position="${position}"></tp-popover></div>`;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.dataset["pi"]).toBe(expected.pi);
    expect(pop.dataset["ti"]).toBe(expected.ti);
    expect(pop.dataset["pb"]).toBe(expected.pb);
    expect(pop.dataset["tb"]).toBe(expected.tb);
  });

  it.each([
    ["start", { pi: "end", ti: "start", pb: "middle", tb: "middle" }],
    ["center", { pi: "center", ti: "center", pb: "middle", tb: "middle" }],
    ["end", { pi: "start", ti: "end", pb: "middle", tb: "middle" }],
    ["top", { pi: "center", ti: "center", pb: "bottom", tb: "top" }],
    ["middle", { pi: "center", ti: "center", pb: "middle", tb: "middle" }],
    ["bottom", { pi: "center", ti: "center", pb: "top", tb: "bottom" }],
  ])("parses single-keyword shorthand %s", async (position, expected) => {
    document.body.innerHTML = `<div><tp-popover position="${position}"></tp-popover></div>`;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.dataset["pi"]).toBe(expected.pi);
    expect(pop.dataset["ti"]).toBe(expected.ti);
    expect(pop.dataset["pb"]).toBe(expected.pb);
    expect(pop.dataset["tb"]).toBe(expected.tb);
  });

  it.each([
    ["top to bottom", { pi: "center", ti: "center", pb: "top", tb: "bottom" }],
    ["start to center", { pi: "start", ti: "center", pb: "middle", tb: "middle" }],
    ["end to start", { pi: "end", ti: "start", pb: "middle", tb: "middle" }],
    ["middle to top", { pi: "center", ti: "center", pb: "middle", tb: "top" }],
  ])("parses single-axis shorthand %s", async (position, expected) => {
    document.body.innerHTML = `<div><tp-popover position="${position}"></tp-popover></div>`;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.dataset["pi"]).toBe(expected.pi);
    expect(pop.dataset["ti"]).toBe(expected.ti);
    expect(pop.dataset["pb"]).toBe(expected.pb);
    expect(pop.dataset["tb"]).toBe(expected.tb);
  });

  it("warns and uses default for invalid position", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    document.body.innerHTML = `<div><tp-popover position="garbage"></tp-popover></div>`;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(warn).toHaveBeenCalled();
    expect(pop.dataset["pi"]).toBe("center");
  });

  it("wires click trigger to togglePopover()", async () => {
    document.body.innerHTML = `
      <button id="t">x</button>
      <div><tp-popover target="#t" trigger="click"></tp-popover></div>
    `;
    const trigger = document.getElementById("t") as HTMLElement;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    const spy = vi.spyOn(pop, "togglePopover").mockImplementation(() => true);
    trigger.click();
    expect(spy).toHaveBeenCalled();
  });

  it("removes trigger listeners on disconnect", async () => {
    document.body.innerHTML = `
      <button id="t">x</button>
      <div><tp-popover target="#t" trigger="click"></tp-popover></div>
    `;
    const trigger = document.getElementById("t") as HTMLElement;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    pop.remove();
    const spy = vi.spyOn(pop, "togglePopover").mockImplementation(() => true);
    trigger.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it("re-resolves anchor when target attribute changes", async () => {
    document.body.innerHTML = `
      <button id="a">a</button>
      <button id="b">b</button>
      <div><tp-popover target="#a"></tp-popover></div>
    `;
    const a = document.getElementById("a") as HTMLElement;
    const b = document.getElementById("b") as HTMLElement;
    const pop = document.querySelector("tp-popover") as PopoverElement;
    await pop.updateComplete;
    expect(pop.anchorElement).toBe(a);
    pop.target = "#b";
    await pop.updateComplete;
    expect(pop.anchorElement).toBe(b);
  });
});
