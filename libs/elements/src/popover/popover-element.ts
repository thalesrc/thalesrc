import { LitElement, html } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { uniqueId } from "@telperion/js-utils/unique-id";
import { DEFAULT_POSITION, parsePosition } from "./position";

declare global {
  interface HTMLElementTagNameMap {
    /**
     * A framework-agnostic popover element built on top of the native
     * Popover API and CSS Anchor Positioning.
     *
     * The element automatically receives the native `popover` attribute
     * (`auto` by default; configurable via the `mode` attribute), resolves
     * its anchor target from the `target` querySelector string (falling
     * back to its `parentElement` if the attribute is missing or fails to
     * resolve), and is positioned **entirely in CSS** via `anchor()` and
     * a `translate` of percentage values driven by the parsed `position`
     * attribute.
     *
     * No JavaScript is involved in placement &mdash; the four data-attrs
     * `data-pi`, `data-ti`, `data-pb`, `data-tb` map onto pre-baked CSS
     * rules in a singleton stylesheet.
     *
     * @example Basic usage with a parent anchor
     * ```html
     * <button>Anchor</button>
     * <div>
     *   <tp-popover position="center to center / bottom to top">
     *     I appear above my parent.
     *   </tp-popover>
     * </div>
     * ```
     *
     * @example Querying the anchor target
     * ```html
     * <button id="trigger">Click me</button>
     * <tp-popover target="#trigger" trigger="click"
     *             position="start to start / top to bottom">
     *   Popover content.
     * </tp-popover>
     * ```
     *
     * @example Fallback positions
     * The popover automatically flips off-axis when there is no room for
     * its primary placement, via the default
     * `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline`.
     * Override on a per-popover basis with plain CSS:
     * ```css
     * tp-popover.no-flip { position-try-fallbacks: none; }
     * ```
     *
     * @attr target - CSS query selector resolved against `document` to find
     *   the anchor element. If missing or unresolved, the popover's
     *   `parentElement` is used.
     * @attr position - Placement spec. Supports four forms:
     *   - Full: `<pop-inl> to <tgt-inl> / <pop-blk> to <tgt-blk>`.
     *   - Two-keyword: `<inline> / <block>` (e.g. `center / top` →
     *     `center to center / bottom to top`). Each half may also be the full
     *     `a to b` form.
     *   - Single axis (no `/`): `<a> to <b>` for one axis only; the other
     *     axis defaults to its centered/middle form. E.g. `top to bottom` →
     *     `center to center / top to bottom`.
     *   - Single keyword: `start`/`center`/`end` (inline; block defaults to
     *     `middle to middle`) or `top`/`middle`/`bottom` (block; inline
     *     defaults to `center to center`).
     *
     *   Inline keywords: `start | center | end`.
     *   Block keywords: `top | middle | bottom`.
     *   Defaults to `center to center / bottom to top`.
     * @attr mode - Mirrored to the native `popover` attribute.
     *   `auto` (default) gives light-dismiss + only-one-open semantics;
     *   `manual` opts out.
     * @attr trigger - How the resolved target opens the popover.
     *   `click` (default), `manual`, or `hover` (also opens on focus).
     */
    "tp-popover": PopoverElement;
  }
}

@customElement("tp-popover")
export class PopoverElement extends LitElement {
  declare private static GLOBAL_STYLE: HTMLStyleElement;

  static {
    const style = (this.GLOBAL_STYLE = document.createElement("style"));

    // Pre-baked rules. Each instance gets:
    //   - data-pi/data-ti/data-pb/data-tb attributes set by JS,
    //   - inline `position-anchor: --tp-popover-N`,
    //   - inline `anchor-name: --tp-popover-N` on the resolved target.
    //
    // Use `margin` on the popover to add gap between the popover and its
    // anchor target. The default `position-try-fallbacks` flips the popover
    // off-axis when there is no room — the engine swaps `inset-*-start` with
    // `inset-*-end` and the `start`/`end` keywords inside `anchor()` for us,
    // and our translate-vars are symmetric so they remain correct after a
    // flip.
    style.textContent = `
      tp-popover {
        --tp-popover-inline-position: attr(data-ti type(*));
        --tp-popover-block-position: attr(data-tb type(*));
        inset: auto;
        translate: var(--tp-popover-translate-x, 0) var(--tp-popover-translate-y, 0);
        position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;

        &[data-tb="middle"] {
          --tp-popover-block-position: center;
        }

        &[data-pi="start"],
        &[data-pi="center"] {
          inset-inline-start: anchor(var(--tp-popover-inline-position));
        }

        &[data-pi="center"] {
          --tp-popover-translate-x: -50%;
        }

        &[data-pi="end"] {
          inset-inline-end: anchor(var(--tp-popover-inline-position));
        }

        &[data-pb="top"],
        &[data-pb="middle"] {
          inset-block-start: anchor(var(--tp-popover-block-position));
        }

        &[data-pb="middle"] {
          --tp-popover-translate-y: -50%;
        }

        &[data-pb="bottom"] {
          inset-block-end: anchor(var(--tp-popover-block-position));
        }
      }
    `;
    document.head.appendChild(style);
  }

  /** Mirrored to the native `popover` attribute. */
  @property({ reflect: true })
  mode: "auto" | "manual" = "auto";

  /** CSS query selector resolved against `document`. */
  @property({ reflect: true })
  target: string | null = null;

  /** Placement spec — see class docs. */
  @property({ reflect: true })
  position: string | null = null;

  /** How the resolved target opens the popover. */
  @property({ reflect: true })
  trigger: "manual" | "click" | "hover" = "click";

  /** Per-instance anchor id (without the leading `--`). */
  readonly #anchorId = uniqueId("tp-popover");

  /** Currently resolved anchor element (if any). */
  #anchorEl: HTMLElement | null = null;

  /** The currently-resolved anchor element. */
  get anchorElement(): HTMLElement | null {
    return this.#anchorEl;
  }

  /** Custom-property name (with leading `--`) bound on the anchor. */
  get anchorName(): string {
    return `--${this.#anchorId}`;
  }

  /** Whether we set `anchor-name` on the current anchor (so we clean up). */
  #anchorNameSet = false;

  /** Bound trigger listener cleanups for the current anchor. */
  #triggerCleanups: Array<() => void> = [];

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncMode();
    this.#syncAnchor();
    this.#syncPosition();
    this.#syncTrigger();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#clearTrigger();
    this.#releaseAnchor();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("mode")) this.#syncMode();
    if (changed.has("target")) {
      this.#syncAnchor();
      this.#syncTrigger();
    }
    if (changed.has("position")) this.#syncPosition();
    if (changed.has("trigger")) this.#syncTrigger();
  }

  protected override render(): TemplateResult {
    return html``;
  }

  // -- Mode / popover attr --------------------------------------------------

  #syncMode(): void {
    const value = this.mode === "manual" ? "manual" : "auto";
    if (this.getAttribute("popover") !== value) {
      this.setAttribute("popover", value);
    }
  }

  // -- Anchor resolution ----------------------------------------------------

  #resolveTarget(): HTMLElement | null {
    const selector = this.target;
    if (selector) {
      try {
        const el = document.querySelector(selector);
        if (el instanceof HTMLElement) return el;
        console.warn(`<tp-popover>: target "${selector}" did not resolve to an HTMLElement; using parentElement.`);
      } catch {
        console.warn(`<tp-popover>: invalid target selector "${selector}"; using parentElement.`);
      }
    }
    const parent = this.parentElement;
    return parent instanceof HTMLElement ? parent : null;
  }

  #syncAnchor(): void {
    const next = this.#resolveTarget();
    if (next === this.#anchorEl) {
      // Re-apply in case the target lost its anchor-name in between.
      if (next) this.#applyAnchorTo(next);
      return;
    }
    this.#releaseAnchor();
    this.#anchorEl = next;
    if (next) this.#applyAnchorTo(next);
  }

  #applyAnchorTo(el: HTMLElement): void {
    const cssName = `--${this.#anchorId}`;
    const existing = el.style.getPropertyValue("anchor-name").trim();
    if (existing && existing !== cssName) {
      // Don't overwrite a pre-existing anchor-name; just bind to it.
      this.style.setProperty("position-anchor", existing);
      this.#anchorNameSet = false;
      return;
    }
    el.style.setProperty("anchor-name", cssName);
    this.style.setProperty("position-anchor", cssName);
    this.#anchorNameSet = true;
  }

  #releaseAnchor(): void {
    if (this.#anchorEl && this.#anchorNameSet) {
      const cssName = `--${this.#anchorId}`;
      if (this.#anchorEl.style.getPropertyValue("anchor-name").trim() === cssName) {
        this.#anchorEl.style.removeProperty("anchor-name");
      }
    }
    this.#anchorEl = null;
    this.#anchorNameSet = false;
    this.style.removeProperty("position-anchor");
  }

  // -- Position parsing -----------------------------------------------------

  #syncPosition(): void {
    let parsed = parsePosition(this.position);
    if (this.position && !parsed) {
      console.warn(`<tp-popover>: invalid position "${this.position}"; using default.`);
    }
    parsed ??= DEFAULT_POSITION;

    this.dataset["pi"] = parsed.popInline;
    this.dataset["ti"] = parsed.targetInline;
    this.dataset["pb"] = parsed.popBlock;
    this.dataset["tb"] = parsed.targetBlock;
  }

  // -- Trigger handling -----------------------------------------------------

  #clearTrigger(): void {
    for (const fn of this.#triggerCleanups) fn();
    this.#triggerCleanups = [];
  }

  #syncTrigger(): void {
    this.#clearTrigger();
    const anchor = this.#anchorEl;
    if (!anchor) return;

    if (this.trigger === "click") {
      const onClick = (event: MouseEvent): void => {
        // If the click bubbled up from inside the popover itself (which
        // happens when the anchor is an ancestor of the popover), ignore
        // it — otherwise the popover would close immediately on every
        // interaction with its own content.
        if (event.composedPath().includes(this)) return;
        try {
          this.togglePopover();
        } catch {
          /* not connected / unsupported */
        }
      };
      anchor.addEventListener("click", onClick);
      this.#triggerCleanups.push(() => anchor.removeEventListener("click", onClick));
      return;
    }

    if (this.trigger === "hover") {
      let hideTimer: ReturnType<typeof setTimeout> | null = null;
      const cancelHide = (): void => {
        if (hideTimer !== null) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
      };
      const show = (): void => {
        cancelHide();
        try {
          this.showPopover();
        } catch {
          /* already open / unsupported */
        }
      };
      const scheduleHide = (): void => {
        cancelHide();
        hideTimer = setTimeout(() => {
          try {
            this.hidePopover();
          } catch {
            /* already closed / unsupported */
          }
        }, 120);
      };

      anchor.addEventListener("pointerenter", show);
      anchor.addEventListener("pointerleave", scheduleHide);
      anchor.addEventListener("focusin", show);
      anchor.addEventListener("focusout", scheduleHide);
      this.addEventListener("pointerenter", cancelHide);
      this.addEventListener("pointerleave", scheduleHide);
      this.addEventListener("focusin", cancelHide);
      this.addEventListener("focusout", scheduleHide);

      this.#triggerCleanups.push(() => {
        cancelHide();
        anchor.removeEventListener("pointerenter", show);
        anchor.removeEventListener("pointerleave", scheduleHide);
        anchor.removeEventListener("focusin", show);
        anchor.removeEventListener("focusout", scheduleHide);
        this.removeEventListener("pointerenter", cancelHide);
        this.removeEventListener("pointerleave", scheduleHide);
        this.removeEventListener("focusin", cancelHide);
        this.removeEventListener("focusout", scheduleHide);
      });
    }
  }
}
