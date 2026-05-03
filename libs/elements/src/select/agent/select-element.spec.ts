import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// jsdom <24 doesn't implement ElementInternals or attachInternals — polyfill
// the small surface that <tp-select-old> uses BEFORE importing the element.
type FakeInternals = {
  validity: { valueMissing: boolean };
  setFormValue(_value: string | FormData | File | null): void;
  setValidity(
    flags: Partial<ValidityState>,
    message?: string,
    anchor?: HTMLElement,
  ): void;
};

const _proto = HTMLElement.prototype as unknown as {
  attachInternals?: () => FakeInternals;
};
if (typeof _proto.attachInternals !== "function") {
  _proto.attachInternals = function attachInternals(): FakeInternals {
    const internals: FakeInternals = {
      validity: { valueMissing: false },
      setFormValue(): void {
        /* noop in jsdom */
      },
      setValidity(flags): void {
        this.validity.valueMissing = !!flags.valueMissing;
      },
    };
    return internals;
  };
}

import { SelectElement } from "./select-element";
import {
  computeNextIndex,
  firstEnabledIndex,
  getActionForKey,
  lastEnabledIndex,
  matchTypeahead,
} from "./select-keyboard";
import { parseDatalists } from "./select-options";
import type { SelectOption } from "./types";

// jsdom doesn't implement the Popover API or ElementInternals form bits
// fully — patch the bare minimum so the element can run.
const proto = HTMLElement.prototype as unknown as {
  togglePopover?: () => boolean;
  showPopover?: () => void;
  hidePopover?: () => void;
};
proto.togglePopover ??= function (): boolean {
  return true;
};
proto.showPopover ??= function (): void {
  this.dispatchEvent(
    new (globalThis.ToggleEvent ?? Event)("toggle", {
      // @ts-expect-error - ToggleEvent init is widened
      newState: "open",
      oldState: "closed",
    }),
  );
};
proto.hidePopover ??= function (): void {
  this.dispatchEvent(
    new (globalThis.ToggleEvent ?? Event)("toggle", {
      // @ts-expect-error - ToggleEvent init is widened
      newState: "closed",
      oldState: "open",
    }),
  );
};

if (typeof globalThis.ToggleEvent === "undefined") {
  class ToggleEventPolyfill extends Event {
    oldState: string;
    newState: string;
    constructor(type: string, init: { oldState?: string; newState?: string } = {}) {
      super(type);
      this.oldState = init.oldState ?? "";
      this.newState = init.newState ?? "";
    }
  }
  // @ts-expect-error - install polyfill globally
  globalThis.ToggleEvent = ToggleEventPolyfill;
}

function makeOptions(values: readonly { v: string; disabled?: boolean; label?: string }[]): SelectOption[] {
  return values.map(({ v, disabled = false, label }) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = label ?? v;
    if (disabled) o.disabled = true;
    return {
      source: o,
      value: v,
      label: label ?? v,
      disabled,
    };
  });
}

async function setup(html: string): Promise<SelectElement> {
  document.body.innerHTML = html;
  const sel = document.querySelector("tp-select-old") as SelectElement;
  await sel.updateComplete;
  return sel;
}

describe("<tp-select-old>", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("registers the custom element", () => {
    expect(customElements.get("tp-select-old")).toBe(SelectElement);
  });

  it("renders a trigger and a tp-popover panel", async () => {
    const sel = await setup(`<tp-select-old></tp-select-old>`);
    expect(sel.querySelector(':scope > button[part="trigger"]')).toBeTruthy();
    expect(sel.querySelector(":scope > tp-popover")).toBeTruthy();
  });

  it("parses a single datalist into one group with options", async () => {
    const sel = await setup(`
      <tp-select-old>
        <datalist>
          <option value="a">Apple</option>
          <option value="b">Banana</option>
        </datalist>
      </tp-select-old>
    `);
    const groups = parseDatalists(sel);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.options.map((o) => o.value)).toEqual(["a", "b"]);
    expect(groups[0]?.options[0]?.label).toBe("Apple");
  });

  it("parses multiple datalists as separate groups with labels", async () => {
    const sel = await setup(`
      <tp-select-old>
        <datalist label="Fruits"><option>apple</option></datalist>
        <datalist id="veg"><option>carrot</option></datalist>
        <datalist><option>plain</option></datalist>
      </tp-select-old>
    `);
    const groups = parseDatalists(sel);
    expect(groups.map((g) => g.label)).toEqual(["Fruits", "veg", ""]);
    expect(groups.flatMap((g) => g.options.map((o) => o.value))).toEqual([
      "apple",
      "carrot",
      "plain",
    ]);
  });

  it("renders option DOM with correct ARIA roles", async () => {
    const sel = await setup(`
      <tp-select-old>
        <datalist label="G"><option value="x">X</option></datalist>
      </tp-select-old>
    `);
    expect(sel.querySelector('[role="listbox"]')).toBeTruthy();
    const opt = sel.querySelector('[role="option"]') as HTMLElement;
    expect(opt?.dataset["value"]).toBe("x");
    expect(opt?.getAttribute("aria-selected")).toBe("false");
  });

  it("hides raw <datalist> children via global CSS", async () => {
    const sel = await setup(`
      <tp-select-old>
        <datalist><option>x</option></datalist>
      </tp-select-old>
    `);
    const dl = sel.querySelector(":scope > datalist") as HTMLElement;
    expect(dl).toBeTruthy();
    // jsdom honours the !important display rule from the injected stylesheet.
    expect(window.getComputedStyle(dl).display).toBe("none");
  });

  it("clicking an option updates value and dispatches tp-select-change (single)", async () => {
    const sel = await setup(`
      <tp-select-old>
        <datalist><option value="a">A</option><option value="b">B</option></datalist>
      </tp-select-old>
    `);
    const events: CustomEvent[] = [];
    sel.addEventListener("tp-select-change", (e) => events.push(e as CustomEvent));

    const opt = sel.querySelector('[data-value="b"]') as HTMLElement;
    opt.click();
    await sel.updateComplete;

    expect(sel.value).toBe("b");
    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toMatchObject({
      value: "b",
      values: ["b"],
    });
  });

  it("multiple mode toggles values without closing", async () => {
    const sel = await setup(`
      <tp-select-old multiple>
        <datalist>
          <option value="a">A</option>
          <option value="b">B</option>
          <option value="c">C</option>
        </datalist>
      </tp-select-old>
    `);
    sel.show();
    await sel.updateComplete;

    (sel.querySelector('[data-value="a"]') as HTMLElement).click();
    await sel.updateComplete;
    (sel.querySelector('[data-value="c"]') as HTMLElement).click();
    await sel.updateComplete;
    expect(sel.values).toEqual(["a", "c"]);

    // Toggle 'a' off
    (sel.querySelector('[data-value="a"]') as HTMLElement).click();
    await sel.updateComplete;
    expect(sel.values).toEqual(["c"]);
    expect(sel.value).toBe("c");
  });

  it("comma-separated value round-trips via the property", async () => {
    const sel = await setup(`
      <tp-select-old multiple value="a,c">
        <datalist><option>a</option><option>b</option><option>c</option></datalist>
      </tp-select-old>
    `);
    expect(sel.values).toEqual(["a", "c"]);
    sel.value = "b,a";
    await sel.updateComplete;
    expect(sel.values).toEqual(["b", "a"]);
  });

  it("MutationObserver picks up newly-added options", async () => {
    const sel = await setup(`
      <tp-select-old>
        <datalist><option value="a">A</option></datalist>
      </tp-select-old>
    `);
    const dl = sel.querySelector("datalist") as HTMLDataListElement;
    const newOpt = document.createElement("option");
    newOpt.value = "b";
    newOpt.textContent = "B";
    dl.appendChild(newOpt);

    // Wait a microtask for the observer to fire + Lit to update.
    await new Promise<void>((r) => queueMicrotask(r));
    await sel.updateComplete;

    expect(sel.querySelector('[data-value="b"]')).toBeTruthy();
  });

  it("required + empty makes internals.validity.valueMissing true", async () => {
    const sel = await setup(`
      <tp-select-old required name="f">
        <datalist><option value="a">A</option></datalist>
      </tp-select-old>
    `);
    expect(sel.internals.validity.valueMissing).toBe(true);

    (sel.querySelector('[data-value="a"]') as HTMLElement).click();
    await sel.updateComplete;
    expect(sel.internals.validity.valueMissing).toBe(false);
  });

  it("formResetCallback restores the initial value", async () => {
    const sel = await setup(`
      <tp-select-old value="a">
        <datalist><option>a</option><option>b</option></datalist>
      </tp-select-old>
    `);
    (sel.querySelector('[data-value="b"]') as HTMLElement).click();
    await sel.updateComplete;
    expect(sel.value).toBe("b");

    sel.formResetCallback();
    await sel.updateComplete;
    expect(sel.value).toBe("a");
  });

  it("respects disabled options on click", async () => {
    const sel = await setup(`
      <tp-select-old>
        <datalist>
          <option value="a">A</option>
          <option value="b" disabled>B</option>
        </datalist>
      </tp-select-old>
    `);
    (sel.querySelector('[data-value="b"]') as HTMLElement).click();
    await sel.updateComplete;
    expect(sel.value).toBe("");
  });

  it("placeholder is shown when nothing is selected", async () => {
    const sel = await setup(`
      <tp-select-old placeholder="Pick one">
        <datalist><option>a</option></datalist>
      </tp-select-old>
    `);
    const label = sel.querySelector('[part="trigger-label"]') as HTMLElement;
    expect(label.textContent?.trim()).toBe("Pick one");
  });

  describe("custom trigger via [tp-select-button]", () => {
    it("suppresses the default button when a [tp-select-button] child is present", async () => {
      const sel = await setup(`
        <tp-select-old>
          <button tp-select-button>Custom</button>
          <datalist><option>a</option></datalist>
        </tp-select-old>
      `);
      expect(sel.querySelector(':scope > button[part="trigger"]')).toBeNull();
      expect(sel.querySelector(":scope > [tp-select-button]")).toBeTruthy();
    });

    it("mirrors aria-expanded / aria-controls / disabled onto the custom button", async () => {
      const sel = await setup(`
        <tp-select-old disabled>
          <button tp-select-button>Custom</button>
          <datalist><option>a</option></datalist>
        </tp-select-old>
      `);
      const btn = sel.querySelector(":scope > [tp-select-button]") as HTMLElement;
      expect(btn.getAttribute("role")).toBe("combobox");
      expect(btn.getAttribute("aria-haspopup")).toBe("listbox");
      expect(btn.getAttribute("aria-controls")).toMatch(/-listbox$/);
      expect(btn.getAttribute("aria-expanded")).toBe("false");
      expect(btn.hasAttribute("disabled")).toBe(true);
    });

    it("re-renders the default button when the [tp-select-button] child is removed", async () => {
      const sel = await setup(`
        <tp-select-old>
          <button tp-select-button>Custom</button>
          <datalist><option>a</option></datalist>
        </tp-select-old>
      `);
      expect(sel.querySelector(':scope > button[part="trigger"]')).toBeNull();

      const custom = sel.querySelector(":scope > [tp-select-button]") as HTMLElement;
      custom.remove();
      await new Promise<void>((r) => queueMicrotask(r));
      await sel.updateComplete;

      expect(sel.querySelector(':scope > button[part="trigger"]')).toBeTruthy();
    });
  });
});

// -- Pure helpers -----------------------------------------------------------

describe("select-keyboard helpers", () => {
  describe("getActionForKey", () => {
    it.each([
      ["ArrowDown", "next"],
      ["ArrowUp", "prev"],
      ["Home", "first"],
      ["End", "last"],
      ["Enter", "select"],
      [" ", "select"],
      ["Escape", "close"],
      ["a", "typeahead"],
    ] as const)("%s → %s", (key, expected) => {
      expect(getActionForKey(new KeyboardEvent("keydown", { key }))).toBe(expected);
    });

    it("ignores Ctrl/Meta/Alt single-char combos", () => {
      expect(getActionForKey(new KeyboardEvent("keydown", { key: "a", ctrlKey: true }))).toBeNull();
    });

    it("returns null for unhandled keys", () => {
      expect(getActionForKey(new KeyboardEvent("keydown", { key: "F5" }))).toBeNull();
    });
  });

  describe("computeNextIndex", () => {
    const opts = makeOptions([{ v: "a" }, { v: "b", disabled: true }, { v: "c" }]);

    it("moves forward skipping disabled", () => {
      expect(computeNextIndex({ current: 0, direction: 1, options: opts })).toBe(2);
    });

    it("moves backward skipping disabled", () => {
      expect(computeNextIndex({ current: 2, direction: -1, options: opts })).toBe(0);
    });

    it("wraps around", () => {
      expect(computeNextIndex({ current: 2, direction: 1, options: opts })).toBe(0);
    });

    it("returns -1 when all disabled", () => {
      const all = makeOptions([{ v: "a", disabled: true }, { v: "b", disabled: true }]);
      expect(computeNextIndex({ current: 0, direction: 1, options: all })).toBe(-1);
    });
  });

  describe("first/lastEnabledIndex", () => {
    it("skips leading/trailing disabled options", () => {
      const opts = makeOptions([
        { v: "a", disabled: true },
        { v: "b" },
        { v: "c" },
        { v: "d", disabled: true },
      ]);
      expect(firstEnabledIndex(opts)).toBe(1);
      expect(lastEnabledIndex(opts)).toBe(2);
    });
  });

  describe("matchTypeahead", () => {
    const opts = makeOptions([
      { v: "1", label: "Apple" },
      { v: "2", label: "Apricot" },
      { v: "3", label: "Banana" },
    ]);

    it("finds the next match for a single-char buffer", () => {
      expect(matchTypeahead({ buffer: "a", options: opts, startIndex: 0 })).toBe(1);
    });

    it("stays on current option for multi-char buffer", () => {
      expect(matchTypeahead({ buffer: "ap", options: opts, startIndex: 0 })).toBe(0);
    });

    it("returns -1 when no match", () => {
      expect(matchTypeahead({ buffer: "z", options: opts, startIndex: 0 })).toBe(-1);
    });
  });
});
