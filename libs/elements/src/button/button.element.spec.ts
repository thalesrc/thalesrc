import { describe, expect, it } from "vitest";

import { ButtonElement } from "./button.element";

describe("<tp-button>", () => {
  const setup = async (markup = `<tp-button></tp-button>`): Promise<ButtonElement> => {
    document.body.innerHTML = markup;
    const el = document.querySelector("tp-button") as ButtonElement;
    await el.updateComplete;
    return el;
  };

  it("registers the custom element", () => {
    expect(customElements.get("tp-button")).toBe(ButtonElement);
  });

  it("uses light DOM as render root", async () => {
    const el = await setup();
    expect(el.renderRoot).toBe(el);
  });

  it("applies default property values", async () => {
    const el = await setup();
    expect(el.variant).toBe("solid");
    expect(el.color).toBe("primary");
    expect(el.shade).toBe(500);
  });

  it("reflects variant and color attributes", async () => {
    const el = await setup(`<tp-button variant="outline" color="success"></tp-button>`);
    expect(el.variant).toBe("outline");
    expect(el.color).toBe("success");
    expect(el.getAttribute("variant")).toBe("outline");
    expect(el.getAttribute("color")).toBe("success");
  });

  it("parses shade as a number and reflects it", async () => {
    const el = await setup(`<tp-button shade="700"></tp-button>`);
    expect(el.shade).toBe(700);
    expect(el.getAttribute("shade")).toBe("700");
  });

  it("clamps shade to the 0-1000 range", async () => {
    const high = await setup(`<tp-button shade="2500"></tp-button>`);
    expect(high.shade).toBe(1000);

    const low = await setup(`<tp-button shade="-50"></tp-button>`);
    expect(low.shade).toBe(0);
  });

  it("falls back to 500 when shade is not a number", async () => {
    const el = await setup(`<tp-button shade="not-a-number"></tp-button>`);
    expect(el.shade).toBe(500);
  });
});
