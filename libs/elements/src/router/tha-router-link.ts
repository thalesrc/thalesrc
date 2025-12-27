import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getHistoryByType, GLOBAL_HISTORY, GLOBAL_HISTORY_TYPE, HistoryType } from "./history";
import { computed, signal, SignalWatcher } from "@lit-labs/signals";
import { History } from "history";
import { compact } from '@thalesrc/js-utils/array/compact';

type LinkSymbol = 'back' | 'forward';
type AbsolutePath = '/' | `/${string}`;
type RelativePath = './' | `./${string}` | `../${string}`;
type LinkType = LinkSymbol | AbsolutePath | RelativePath;

@customElement("tha-router-link")
export class ThaRouterLink extends (SignalWatcher(LitElement) as typeof LitElement) {
  #relativeLinkPattern = /^((\.\.\/)+([^./].*)?|\.\/[^./].*|\.\.)$/i;

  @property({ type: String })
  history: HistoryType | null = null;

  @property({ type: String })
  to: LinkType | null = null;

  #selfHistory = signal<History | null>(this.history ? getHistoryByType(this.history) : null);
  #history = computed(() => this.#selfHistory.get() ?? GLOBAL_HISTORY.get());

  override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('click', this.#handleClick);
  }

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value);

    switch (name) {
      case 'history':
        this.#selfHistory.set(value ? getHistoryByType(value as HistoryType) : null);
        break;
    }
  }

  #handleClick = (event: MouseEvent) => {
    event.preventDefault();

    const history = this.#history.get();

    if (this.to === 'back') return history.back();
    if (this.to === 'forward') return history.forward();

    const currentPath = history.location.pathname + history.location.search + history.location.hash;

    let link = this.to;
    if (this.#relativeLinkPattern.test(link ?? '')) {
      const segments = compact(currentPath.split('/'));
      const linkSegments = compact(link!.split('/'));

      for (const segment of linkSegments) {
        if (segment === '..') {
          segments.pop();
        } else if (segment !== '.') {
          segments.push(segment);
        }
      }

      link = '/' + segments.join('/');
    }

    link = link?.replaceAll('//', '/') as '/';

    this.#history.get()?.push(link || '/');
  };

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleClick);
  }

  protected override createRenderRoot() {
    return this;
  }
}
