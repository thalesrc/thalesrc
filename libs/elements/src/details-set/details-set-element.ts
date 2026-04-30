import { LitElement, html } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Splice-style index resolution for `<template summary-marker index="…">`.
 * - Missing / non-finite ⇒ `0` (prepend).
 * - `>= 0` ⇒ clamped to `[0, length]`.
 * - `< 0` ⇒ `length + raw`, clamped to `[0, length]` (so `-1` inserts
 *   before the last child).
 */
function resolveMarkerIndex(raw: string | null, length: number): number {
  if (raw === null || raw === "") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  const i = Math.trunc(n);
  if (i >= 0) return Math.min(i, length);
  return Math.max(0, length + i);
}

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A framework-agnostic grouping element for native `<details>` elements.
     *
     * Tracks the open/closed state of its **direct-child** `<details>` elements
     * and enforces a configurable cap via the `max-open-items` attribute. When
     * the cap is exceeded, the **earliest-opened** child is closed (FIFO).
     *
     * Renders into the **light DOM** so consumers retain full control over the
     * styling of the slotted `<details>` / `<summary>` elements.
     *
     * Modern CSS defaults (smooth open/close via `interpolate-size: allow-keywords`
     * + `::details-content` `block-size` transition) are injected once at the
     * document level. Override timing via the
     * `--tp-details-set-transition-duration` and
     * `--tp-details-set-transition-easing` custom properties. In engines that
     * do not yet support `interpolate-size` / `::details-content`, the
     * animation is simply a no-op &mdash; the JS cap logic still works.
     *
     * Dispatches a bubbling `tp-details-set-change` `CustomEvent` whose
     * `detail` is `{ opened: HTMLDetailsElement[]; closed: HTMLDetailsElement[] }`
     * whenever the cap forces one or more children to close. Listen to the
     * native `toggle` event on the children for ordinary open/close changes.
     *
     * @example Unlimited (the default)
     * ```html
     * <tp-details-set>
     *   <details><summary>One</summary>...</details>
     *   <details><summary>Two</summary>...</details>
     * </tp-details-set>
     * ```
     *
     * @example Accordion
     * ```html
     * <tp-details-set max-open-items="1">
     *   <details><summary>One</summary>...</details>
     *   <details><summary>Two</summary>...</details>
     * </tp-details-set>
     * ```
     *
     * @example Two-at-a-time (FIFO)
     * ```html
     * <tp-details-set max-open-items="2">
     *   <details open><summary>A</summary>...</details>
     *   <details><summary>B</summary>...</details>
     *   <details><summary>C</summary>...</details>
     * </tp-details-set>
     * ```
     *
     * @example Summary markers
     * Direct-child `<template summary-marker index="…">` elements are cloned
     * into every direct-child `<details>`'s `<summary>` at the position given
     * by `index`. The index is splice-style: non-negative counts from the
     * start (clamped to `[0, length]`), negative counts from the end (so
     * `-1` inserts before the last child). Missing/invalid index defaults
     * to `0`. Multiple marker templates apply in document order; each later
     * marker sees the summary's current state (including markers already
     * inserted by earlier templates) when computing its index.
     * ```html
     * <tp-details-set>
     *   <template summary-marker index="0"><span class="chev">▸</span></template>
     *   <template summary-marker index="-1"><span class="badge">★</span></template>
     *
     *   <details><summary>One</summary>...</details>
     *   <details><summary>Two</summary>...</details>
     * </tp-details-set>
     * ```
     * Use ordinary CSS for state-aware styling, e.g.
     * `tp-details-set > details[open] > summary > .chev { rotate: 90deg; }`.
     *
     * @attr max-open-items - Maximum number of direct-child `<details>` allowed
     *   to be open simultaneously. `0` (or missing) means unlimited.
     * @fires tp-details-set-change - When the set of open children changes.
     */
    "tp-details-set": DetailsSetElement;
  }

  interface GlobalEventHandlersEventMap {
    "tp-details-set-change": CustomEvent<{
      opened: HTMLDetailsElement[];
      closed: HTMLDetailsElement[];
    }>;
  }
}

@customElement("tp-details-set")
export class DetailsSetElement extends LitElement {
  declare private static GLOBAL_STYLE: HTMLStyleElement;

  static {
    const style = (this.GLOBAL_STYLE = document.createElement("style"));

    style.textContent = `
      tp-details-set {
        display: block;
        interpolate-size: allow-keywords;
      }

      tp-details-set > details::details-content {
        block-size: 0;
        overflow: clip;
        transition:
          block-size var(--tp-details-set-transition-duration, 0.3s)
                     var(--tp-details-set-transition-easing, ease),
          content-visibility var(--tp-details-set-transition-duration, 0.3s)
                             var(--tp-details-set-transition-easing, ease)
                             allow-discrete;
      }

      tp-details-set > details[open]::details-content {
        block-size: auto;
      }

      /* Hide the native disclosure marker when the consumer has supplied at
         least one custom marker via <template summary-marker>. */
      tp-details-set > details > summary:has(> [tp-summary-marker]) {
        list-style: none;
      }
      tp-details-set > details > summary:has(> [tp-summary-marker])::-webkit-details-marker {
        display: none;
      }
      tp-details-set > details > summary:has(> [tp-summary-marker])::marker {
        content: "";
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Maximum number of direct-child `<details>` allowed open at the same time.
   * `0` (the default) means unlimited.
   */
  @property({ type: Number, reflect: true, attribute: "max-open-items" })
  maxOpenItems = 0;

  /**
   * Default trigger for toggling direct-child `<details>` elements:
   *
   * - `"summary"` (default): clicking anywhere on the `<summary>` toggles
   *   the details (native behavior).
   * - `"marker"`: only clicks on (or inside) an element carrying the
   *   `tp-summary-marker` attribute toggle the details. If the summary has
   *   no marker, this falls back to summary toggle for that details so the
   *   details never becomes un-toggleable.
   *
   * Per-`<details>` `toggle-on` attribute overrides this set-level default.
   * Keyboard activation (Enter/Space on a focused summary) is **never**
   * suppressed, regardless of mode.
   */
  @property({ reflect: true, attribute: "toggle-on" })
  toggleOn: "summary" | "marker" = "summary";

  /** FIFO queue of currently-open direct-child `<details>` elements. */
  #openOrder: HTMLDetailsElement[] = [];

  /** Per-child observers watching the `open` attribute. */
  #childObservers = new Map<HTMLDetailsElement, MutationObserver>();

  /** Observer watching `childList` changes on the host. */
  #childListObserver?: MutationObserver;

  /** Per-marker-template observers (content + `index` attribute changes). */
  #markerObservers = new Map<HTMLTemplateElement, MutationObserver>();

  /**
   * Tracks raw cloned marker nodes inserted into each summary, keyed by the
   * source template, so re-syncs can remove and re-insert without leaving
   * stale DOM behind.
   */
  #insertedMarkers = new WeakMap<
    HTMLElement,
    Map<HTMLTemplateElement, Node[]>
  >();

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    // Capture-phase `toggle` listener: `toggle` does not bubble, but capture
    // phase still reaches ancestors.
    this.addEventListener("toggle", this.#handleToggle, { capture: true });
    // Capture-phase click listener implements `toggle-on="marker"` by calling
    // `preventDefault()` for non-marker clicks on summaries.
    this.addEventListener("click", this.#handleSummaryClick, { capture: true });

    this.#childListObserver = new MutationObserver(this.#handleChildListMutation);
    this.#childListObserver.observe(this, { childList: true });

    this.#syncDirectChildren();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener("toggle", this.#handleToggle, { capture: true } as EventListenerOptions);
    this.removeEventListener("click", this.#handleSummaryClick, { capture: true } as EventListenerOptions);

    this.#childListObserver?.disconnect();
    this.#childListObserver = undefined;

    for (const observer of this.#childObservers.values()) {
      observer.disconnect();
    }
    this.#childObservers.clear();

    for (const observer of this.#markerObservers.values()) {
      observer.disconnect();
    }
    this.#markerObservers.clear();

    this.#openOrder = [];
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("maxOpenItems")) {
      this.#enforceLimit();
    }
  }

  protected override render(): TemplateResult {
    return html``;
  }

  /**
   * Reconcile observers and the FIFO queue with the current direct children.
   * Called on connect and whenever the host's child list mutates.
   */
  #syncDirectChildren(): void {
    const current = new Set<HTMLDetailsElement>(this.#directDetails());

    // Drop observers + queue entries for removed children.
    for (const [child, observer] of this.#childObservers) {
      if (!current.has(child)) {
        observer.disconnect();
        this.#childObservers.delete(child);
      }
    }
    this.#openOrder = this.#openOrder.filter((child) => current.has(child));

    // Attach observers for new children, seed the queue with already-open ones.
    for (const child of current) {
      if (!this.#childObservers.has(child)) {
        const observer = new MutationObserver(() => this.#handleChildOpenMutation(child));
        observer.observe(child, { attributes: true, attributeFilter: ["open"] });
        this.#childObservers.set(child, observer);

        if (child.open && !this.#openOrder.includes(child)) {
          this.#openOrder.push(child);
        }
      }
    }

    this.#enforceLimit();
    this.#syncMarkerTemplates();
    this.#syncAllMarkers();
  }

  /** Reconcile per-template observers with the current marker templates. */
  #syncMarkerTemplates(): void {
    const current = new Set<HTMLTemplateElement>(this.#markerTemplates());

    for (const [template, observer] of this.#markerObservers) {
      if (!current.has(template)) {
        observer.disconnect();
        this.#markerObservers.delete(template);
      }
    }

    for (const template of current) {
      if (!this.#markerObservers.has(template)) {
        const observer = new MutationObserver(this.#handleMarkerTemplateMutation);
        // Watch both the template's own `index` attribute and its content
        // (including nested edits inside `template.content`).
        observer.observe(template, {
          attributes: true,
          attributeFilter: ["index", "summary-marker"],
        });
        observer.observe(template.content, { childList: true, subtree: true, characterData: true, attributes: true });
        this.#markerObservers.set(template, observer);
      }
    }
  }

  #handleMarkerTemplateMutation = (): void => {
    this.#syncAllMarkers();
  };

  /** Apply marker templates to every direct-child `<details>`'s `<summary>`. */
  #syncAllMarkers(): void {
    const templates = this.#markerTemplates();
    for (const details of this.#directDetails()) {
      const summary = details.querySelector(":scope > summary");
      if (summary instanceof HTMLElement) {
        this.#applyMarkersTo(summary, templates);
      }
    }
  }

  #applyMarkersTo(
    summary: HTMLElement,
    templates: HTMLTemplateElement[],
  ): void {
    let perTemplate = this.#insertedMarkers.get(summary);
    if (!perTemplate) {
      perTemplate = new Map();
      this.#insertedMarkers.set(summary, perTemplate);
    }

    // Remove all previously-inserted marker nodes for this summary first, so
    // re-application is order-stable and never duplicates.
    for (const nodes of perTemplate.values()) {
      for (const node of nodes) {
        if (node.parentNode === summary) summary.removeChild(node);
      }
    }
    perTemplate.clear();

    for (const template of templates) {
      const fragment = template.content.cloneNode(true) as DocumentFragment;
      // Capture nodes BEFORE insertion — the fragment empties on append.
      const inserted = Array.from(fragment.childNodes);
      if (inserted.length === 0) continue;

      // Tag every cloned element so consumers can target markers via CSS
      // (e.g. `[tp-summary-marker]`) and so the host stylesheet can hide the
      // native `::marker` on summaries that have a custom marker.
      for (const node of inserted) {
        if (node instanceof Element) node.setAttribute("tp-summary-marker", "");
      }

      const idx = resolveMarkerIndex(
        template.getAttribute("index"),
        summary.childNodes.length,
      );
      const ref = summary.childNodes[idx] ?? null;
      summary.insertBefore(fragment, ref);

      perTemplate.set(template, inserted);
    }
  }

  /** Direct-child `<template>` elements with the `summary-marker` attribute. */
  #markerTemplates(): HTMLTemplateElement[] {
    return Array.from(this.children).filter(
      (c): c is HTMLTemplateElement =>
        c instanceof HTMLTemplateElement && c.hasAttribute("summary-marker"),
    );
  }


  #directDetails(): HTMLDetailsElement[] {
    return Array.from(this.children).filter(
      (c): c is HTMLDetailsElement => c instanceof HTMLDetailsElement,
    );
  }

  #handleChildListMutation = (): void => {
    this.#syncDirectChildren();
  };

  #handleToggle = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement)) return;
    if (target.parentElement !== this) return;

    this.#applyOpenState(target);
  };

  #handleChildOpenMutation = (child: HTMLDetailsElement): void => {
    // Reconcile in case the `toggle` event was missed (e.g. in jsdom or when
    // the `open` attribute is mutated programmatically without a toggle).
    this.#applyOpenState(child);
  };

  /**
   * Capture-phase click handler that suppresses the native toggle when a
   * `<summary>` is clicked outside its marker(s) and the effective
   * `toggle-on` mode is `"marker"`.
   *
   * Resolution per `<details>`:
   * - per-`<details>` `toggle-on` attribute (if `"summary"` or `"marker"`),
   *   else
   * - the host's `toggle-on` property/attribute, else
   * - `"summary"`.
   *
   * Carve-outs:
   * - Keyboard activation (Enter/Space) produces a synthetic click with
   *   `event.detail === 0`; we never suppress those.
   * - If the summary contains no `[tp-summary-marker]` element, fall back to
   *   summary-click toggle so the details cannot become un-toggleable.
   */
  #handleSummaryClick = (event: MouseEvent): void => {
    if (event.defaultPrevented) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const summary = target.closest("summary");
    if (!summary) return;

    const details = summary.parentElement;
    if (!(details instanceof HTMLDetailsElement)) return;
    if (details.parentElement !== this) return;
    // Only intercept clicks targeting the details' own first summary.
    if (summary !== details.querySelector(":scope > summary")) return;

    const mode = this.#resolveToggleOn(details);
    if (mode !== "marker") return;

    // Keyboard-originated synthetic click: never suppress.
    if (event.detail === 0) return;

    // Fallback: if there is no marker in the summary, allow the native toggle
    // so the details never becomes un-toggleable.
    if (!summary.querySelector("[tp-summary-marker]")) return;

    if (target.closest("[tp-summary-marker]")) return;

    event.preventDefault();
  };

  #resolveToggleOn(details: HTMLDetailsElement): "summary" | "marker" {
    const own = details.getAttribute("toggle-on");
    if (own === "marker" || own === "summary") return own;
    return this.toggleOn === "marker" ? "marker" : "summary";
  }

  #applyOpenState(child: HTMLDetailsElement): void {
    const inQueue = this.#openOrder.includes(child);

    if (child.open && !inQueue) {
      this.#openOrder.push(child);
      this.#enforceLimit();
    } else if (!child.open && inQueue) {
      this.#openOrder = this.#openOrder.filter((entry) => entry !== child);
    }
  }

  #enforceLimit(): void {
    const limit = this.maxOpenItems;
    if (!Number.isFinite(limit) || limit <= 0) return;

    const closed: HTMLDetailsElement[] = [];
    while (this.#openOrder.length > limit) {
      const oldest = this.#openOrder.shift();
      if (!oldest) break;
      if (oldest.open) {
        oldest.open = false;
        closed.push(oldest);
      }
    }

    if (closed.length > 0) {
      this.dispatchEvent(
        new CustomEvent("tp-details-set-change", {
          bubbles: true,
          composed: true,
          detail: { opened: [], closed },
        }),
      );
    }
  }
}
