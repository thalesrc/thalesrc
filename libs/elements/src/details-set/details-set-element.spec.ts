import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DetailsSetElement } from "./details-set-element";

function makeSet(html: string): {
  set: DetailsSetElement;
  details: HTMLDetailsElement[];
} {
  document.body.innerHTML = `<tp-details-set>${html}</tp-details-set>`;
  const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
  const details = Array.from(set.children).filter(
    (c): c is HTMLDetailsElement => c instanceof HTMLDetailsElement,
  );
  return { set, details };
}

/**
 * MutationObserver callbacks run as microtasks; awaiting a resolved promise
 * lets the element process pending mutations before assertions run.
 */
function flush(): Promise<void> {
  return Promise.resolve();
}

describe("<tp-details-set>", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("registers the custom element", () => {
    expect(customElements.get("tp-details-set")).toBe(DetailsSetElement);
  });

  it("default (unlimited) keeps every child open", async () => {
    const { details } = makeSet(
      `<details><summary>A</summary></details>
       <details><summary>B</summary></details>
       <details><summary>C</summary></details>`,
    );

    for (const d of details) d.open = true;
    await flush();

    expect(details.map((d) => d.open)).toEqual([true, true, true]);
  });

  it('max-open-items="1" closes the previous open child (FIFO)', async () => {
    const { set, details } = makeSet(
      `<details><summary>A</summary></details>
       <details><summary>B</summary></details>`,
    );
    set.maxOpenItems = 1;

    details[0].open = true;
    await flush();
    expect(details.map((d) => d.open)).toEqual([true, false]);

    details[1].open = true;
    await flush();
    expect(details.map((d) => d.open)).toEqual([false, true]);
  });

  it('max-open-items="2" evicts the oldest of three opens', async () => {
    const { set, details } = makeSet(
      `<details><summary>A</summary></details>
       <details><summary>B</summary></details>
       <details><summary>C</summary></details>`,
    );
    set.maxOpenItems = 2;

    details[0].open = true;
    await flush();
    details[1].open = true;
    await flush();
    expect(details.map((d) => d.open)).toEqual([true, true, false]);

    details[2].open = true;
    await flush();
    expect(details.map((d) => d.open)).toEqual([false, true, true]);
  });

  it("lowering max-open-items at runtime closes oldest entries", async () => {
    const { set, details } = makeSet(
      `<details open><summary>A</summary></details>
       <details open><summary>B</summary></details>
       <details open><summary>C</summary></details>`,
    );
    await flush();
    expect(details.map((d) => d.open)).toEqual([true, true, true]);

    set.maxOpenItems = 1;
    await flush();
    expect(details.map((d) => d.open)).toEqual([false, false, true]);
  });

  it("seeds pre-opened children in document order", async () => {
    const { set, details } = makeSet(
      `<details open><summary>A</summary></details>
       <details open><summary>B</summary></details>
       <details><summary>C</summary></details>`,
    );
    set.maxOpenItems = 2;
    await flush();

    // Open a third => A (oldest) should close.
    details[2].open = true;
    await flush();
    expect(details.map((d) => d.open)).toEqual([false, true, true]);
  });

  it("enforces the cap when a new already-open child is inserted", async () => {
    const { set, details } = makeSet(
      `<details open><summary>A</summary></details>
       <details open><summary>B</summary></details>`,
    );
    set.maxOpenItems = 2;
    await flush();

    const inserted = document.createElement("details");
    inserted.open = true;
    inserted.innerHTML = `<summary>C</summary>`;
    set.appendChild(inserted);
    await flush();

    expect(details[0].open).toBe(false);
    expect(details[1].open).toBe(true);
    expect(inserted.open).toBe(true);
  });

  it("manually closing a child frees a slot in the queue", async () => {
    const { set, details } = makeSet(
      `<details><summary>A</summary></details>
       <details><summary>B</summary></details>
       <details><summary>C</summary></details>`,
    );
    set.maxOpenItems = 2;

    details[0].open = true;
    await flush();
    details[1].open = true;
    await flush();
    details[0].open = false;
    await flush();

    // A is now closed and out of the queue, so opening C should not evict B.
    details[2].open = true;
    await flush();
    expect(details.map((d) => d.open)).toEqual([false, true, true]);
  });

  it("ignores nested (descendant) <details> elements", async () => {
    document.body.innerHTML = `
      <tp-details-set max-open-items="1">
        <details><summary>Outer</summary>
          <details><summary>Inner A</summary></details>
          <details><summary>Inner B</summary></details>
        </details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    const outer = set.querySelector(":scope > details") as HTMLDetailsElement;
    const innerA = outer.querySelectorAll("details")[0];
    const innerB = outer.querySelectorAll("details")[1];

    outer.open = true;
    innerA.open = true;
    innerB.open = true;
    await flush();

    // Both nested details remain open; only the outer is governed by the set.
    expect(innerA.open).toBe(true);
    expect(innerB.open).toBe(true);
    expect(outer.open).toBe(true);
  });

  it("dispatches tp-details-set-change when the cap forces a closure", async () => {
    const { set, details } = makeSet(
      `<details><summary>A</summary></details>
       <details><summary>B</summary></details>`,
    );
    set.maxOpenItems = 1;

    let received: { opened: HTMLDetailsElement[]; closed: HTMLDetailsElement[] } | null = null;
    set.addEventListener("tp-details-set-change", (event) => {
      received = (event as CustomEvent).detail;
    });

    details[0].open = true;
    await flush();
    expect(received).toBeNull();

    details[1].open = true;
    await flush();

    expect(received).not.toBeNull();
    expect(received!.opened).toEqual([]);
    expect(received!.closed).toEqual([details[0]]);
  });
});

describe("<tp-details-set> summary markers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function summaryMarkup(set: DetailsSetElement, i: number): string {
    const details = Array.from(set.children).filter(
      (c): c is HTMLDetailsElement => c instanceof HTMLDetailsElement,
    )[i];
    const summary = details?.querySelector(":scope > summary");
    // Strip the auto-applied `tp-summary-marker=""` attribute from cloned
    // marker elements so tests can assert against the consumer-authored
    // template content directly.
    return (summary?.innerHTML ?? "").replace(/ tp-summary-marker=""/g, "");
  }

  it('clones a marker template at index="0" into every summary', async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="m">M</span></template>
        <details><summary>One</summary></details>
        <details><summary>Two</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    expect(summaryMarkup(set, 0)).toBe('<span class="m">M</span>One');
    expect(summaryMarkup(set, 1)).toBe('<span class="m">M</span>Two');
  });

  it('inserts at index="-1" before the last child', async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="-1"><span class="m">M</span></template>
        <details><summary><b>label</b></summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    expect(summaryMarkup(set, 0)).toBe('<span class="m">M</span><b>label</b>');
  });

  it("clamps a too-negative index to the start", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="-99"><span class="m">M</span></template>
        <details><summary>X<i>Y</i></summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    expect(summaryMarkup(set, 0)).toBe('<span class="m">M</span>X<i>Y</i>');
  });

  it("clamps a too-large positive index to the end", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="99"><span class="m">M</span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    expect(summaryMarkup(set, 0)).toBe('label<span class="m">M</span>');
  });

  it("defaults missing index to 0 (prepend)", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker><span class="m">M</span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    expect(summaryMarkup(set, 0)).toBe('<span class="m">M</span>label');
  });

  it("applies multiple marker templates in document order", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="a">A</span></template>
        <template summary-marker index="2"><span class="b">B</span></template>
        <details><summary>X</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    // Each later marker sees the summary's current state (including markers
    // inserted by earlier templates) when computing its index.
    expect(summaryMarkup(set, 0)).toBe(
      '<span class="a">A</span>X<span class="b">B</span>',
    );
  });

  it("applies markers to dynamically inserted <details>", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="m">M</span></template>
        <details><summary>One</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    const newDetails = document.createElement("details");
    newDetails.innerHTML = `<summary>Two</summary>`;
    set.appendChild(newDetails);
    await flush();

    expect(summaryMarkup(set, 1)).toBe('<span class="m">M</span>Two');
  });

  it("re-renders without duplicates when the template content changes", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="m">M</span></template>
        <details><summary>One</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    const template = set.querySelector("template") as HTMLTemplateElement;
    // Replace template content.
    template.content.replaceChildren();
    const next = document.createElement("span");
    next.className = "m2";
    next.textContent = "N";
    template.content.appendChild(next);
    await flush();

    expect(summaryMarkup(set, 0)).toBe('<span class="m2">N</span>One');
  });

  it("relocates the marker when the template's index attribute changes", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="m">M</span></template>
        <details><summary>X<i>Y</i></summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    expect(summaryMarkup(set, 0)).toBe('<span class="m">M</span>X<i>Y</i>');

    const template = set.querySelector("template") as HTMLTemplateElement;
    template.setAttribute("index", "-1");
    await flush();

    expect(summaryMarkup(set, 0)).toBe('X<span class="m">M</span><i>Y</i>');
  });

  it("removes inserted nodes when the marker template is removed", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="m">M</span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    const template = set.querySelector("template") as HTMLTemplateElement;
    template.remove();
    await flush();

    expect(summaryMarkup(set, 0)).toBe("label");
  });

  it("does not affect FIFO eviction (regression)", async () => {
    document.body.innerHTML = `
      <tp-details-set max-open-items="1">
        <template summary-marker index="0"><span class="m">M</span></template>
        <details><summary>A</summary></details>
        <details><summary>B</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    const details = Array.from(set.children).filter(
      (c): c is HTMLDetailsElement => c instanceof HTMLDetailsElement,
    );
    await flush();

    details[0].open = true;
    await flush();
    details[1].open = true;
    await flush();

    expect(details.map((d) => d.open)).toEqual([false, true]);
    expect(summaryMarkup(set, 0)).toBe('<span class="m">M</span>A');
    expect(summaryMarkup(set, 1)).toBe('<span class="m">M</span>B');
  });

  it("does not mark nested (descendant) summaries", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="m">M</span></template>
        <details>
          <summary>Outer</summary>
          <details><summary>Inner</summary></details>
        </details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    const outer = set.querySelector(":scope > details") as HTMLDetailsElement;
    const outerSummary = outer.querySelector(":scope > summary") as HTMLElement;
    const inner = outer.querySelector("details") as HTMLDetailsElement;
    const innerSummary = inner.querySelector(":scope > summary") as HTMLElement;

    expect(outerSummary.innerHTML.replace(/ tp-summary-marker=""/g, "")).toBe(
      '<span class="m">M</span>Outer',
    );
    expect(innerSummary.innerHTML).toBe("Inner");
  });

  it("tags every cloned marker element with the tp-summary-marker attribute", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="m">M</span><i>!</i></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    const summary = set.querySelector(":scope > details > summary") as HTMLElement;
    const tagged = summary.querySelectorAll("[tp-summary-marker]");
    expect(tagged.length).toBe(2);
    expect(tagged[0].tagName).toBe("SPAN");
    expect(tagged[1].tagName).toBe("I");

    // The original template content is untouched (no attribute leaked back).
    const template = set.querySelector("template") as HTMLTemplateElement;
    expect(
      template.content.querySelectorAll("[tp-summary-marker]").length,
    ).toBe(0);
  });
});

describe("<tp-details-set> toggle-on", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  /**
   * Dispatch a click on `target` from `from` (defaults to `target`) and
   * return whether the native toggle would proceed (i.e. `!defaultPrevented`).
   *
   * jsdom does not reliably perform the native `<summary>` -> `<details>.open`
   * toggle, so we assert on `defaultPrevented` which is the actual contract
   * the element implements.
   */
  function dispatchClick(target: Element, opts: MouseEventInit = {}): MouseEvent {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: 1,
      ...opts,
    });
    target.dispatchEvent(event);
    return event;
  }

  it("default mode does not preventDefault on summary clicks", async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <details><summary>A</summary></details>
      </tp-details-set>
    `;
    await flush();
    const summary = document.querySelector("summary") as HTMLElement;

    const event = dispatchClick(summary);

    expect(event.defaultPrevented).toBe(false);
  });

  it('toggle-on="marker" suppresses summary clicks outside any marker', async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    await flush();
    const summary = document.querySelector("summary") as HTMLElement;
    const labelText = Array.from(summary.childNodes).find(
      (n) => n.nodeType === Node.TEXT_NODE,
    );
    expect(labelText).toBeTruthy();

    // Click the summary itself (outside the marker).
    const summaryEvent = dispatchClick(summary);
    expect(summaryEvent.defaultPrevented).toBe(true);
  });

  it('toggle-on="marker" allows clicks on the marker', async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    await flush();
    const marker = document.querySelector("[tp-summary-marker]") as HTMLElement;

    const event = dispatchClick(marker);

    expect(event.defaultPrevented).toBe(false);
  });

  it('toggle-on="marker" allows clicks on a descendant of the marker', async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <template summary-marker index="0"><span class="chev"><i class="dot">·</i></span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    await flush();
    const inner = document.querySelector(".dot") as HTMLElement;

    const event = dispatchClick(inner);

    expect(event.defaultPrevented).toBe(false);
  });

  it('toggle-on="marker" falls back to summary toggle when no marker exists', async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    await flush();
    const summary = document.querySelector("summary") as HTMLElement;

    const event = dispatchClick(summary);

    // No marker present => fallback => allow native toggle.
    expect(event.defaultPrevented).toBe(false);
  });

  it('per-details toggle-on="summary" overrides set-level "marker"', async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details toggle-on="summary"><summary>A</summary></details>
        <details><summary>B</summary></details>
      </tp-details-set>
    `;
    await flush();
    const summaries = document.querySelectorAll("summary");
    const summaryA = summaries[0] as HTMLElement;
    const summaryB = summaries[1] as HTMLElement;

    expect(dispatchClick(summaryA).defaultPrevented).toBe(false);
    expect(dispatchClick(summaryB).defaultPrevented).toBe(true);
  });

  it('per-details toggle-on="marker" overrides set-level default', async () => {
    document.body.innerHTML = `
      <tp-details-set>
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details toggle-on="marker"><summary>A</summary></details>
        <details><summary>B</summary></details>
      </tp-details-set>
    `;
    await flush();
    const summaries = document.querySelectorAll("summary");
    const summaryA = summaries[0] as HTMLElement;
    const summaryB = summaries[1] as HTMLElement;

    expect(dispatchClick(summaryA).defaultPrevented).toBe(true);
    expect(dispatchClick(summaryB).defaultPrevented).toBe(false);
  });

  it("never suppresses keyboard-originated clicks (detail === 0)", async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    await flush();
    const summary = document.querySelector("summary") as HTMLElement;

    const event = dispatchClick(summary, { detail: 0 });

    expect(event.defaultPrevented).toBe(false);
  });

  it("falls back to summary toggle after the only marker template is removed", async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details><summary>label</summary></details>
      </tp-details-set>
    `;
    const set = document.body.querySelector("tp-details-set") as DetailsSetElement;
    await flush();

    const summary = document.querySelector("summary") as HTMLElement;
    expect(dispatchClick(summary).defaultPrevented).toBe(true);

    set.querySelector("template")?.remove();
    await flush();

    expect(dispatchClick(summary).defaultPrevented).toBe(false);
  });

  it("does not intercept clicks on nested (descendant) summaries", async () => {
    document.body.innerHTML = `
      <tp-details-set toggle-on="marker">
        <template summary-marker index="0"><span class="chev">▸</span></template>
        <details>
          <summary>Outer</summary>
          <details><summary>Inner</summary></details>
        </details>
      </tp-details-set>
    `;
    await flush();
    const innerSummary = document.querySelectorAll("summary")[1] as HTMLElement;

    const event = dispatchClick(innerSummary);

    expect(event.defaultPrevented).toBe(false);
  });
});
