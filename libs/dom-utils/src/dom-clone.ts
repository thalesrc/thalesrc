export interface DomCloneOptions {
  /** Sync attribute changes (including inline `style`). Default: `true`. */
  attributes?: boolean;
  /** Sync child node insertions/removals across the subtree. Default: `true`. */
  childList?: boolean;
  /** Sync text/character-data changes across the subtree. Default: `true`. */
  characterData?: boolean;
}

/**
 * Deep-clones a target element and keeps the clone in sync with subsequent
 * mutations (attributes, child nodes, character data) of the original.
 *
 * Sync is one-way: changes on the clone are not reflected back to the target.
 *
 * @example
 * ```ts
 * const mirror = new DomClone(targetEl);
 * container.append(mirror.clone);
 * // ...later
 * mirror.disconnect();
 * ```
 */
export class DomClone<T extends Element = Element> {
  /** The live, synced clone of the target. */
  readonly clone: T;

  readonly #target: T;
  readonly #observer: MutationObserver;
  #disconnected = false;

  constructor(target: T, options: DomCloneOptions = {}) {
    const {
      attributes = true,
      childList = true,
      characterData = true,
    } = options;

    this.#target = target;
    this.clone = target.cloneNode(true) as T;

    this.#observer = new MutationObserver(records => this.#apply(records));
    this.#observer.observe(target, {
      attributes,
      childList,
      characterData,
      subtree: true,
    });
  }

  /** Stops mirroring further mutations. Idempotent. */
  disconnect(): void {
    if (this.#disconnected) return;
    this.#disconnected = true;
    this.#observer.disconnect();
  }

  #apply(records: MutationRecord[]): void {
    for (const record of records) {
      const path = this.#pathTo(record.target);

      if (!path) continue;

      const mirrored = this.#descend(path);

      if (!mirrored) continue;

      switch (record.type) {
        case 'attributes':
          this.#syncAttribute(record, mirrored as Element);

          break;
        case 'characterData':
          mirrored.nodeValue = record.target.nodeValue;

          break;
        case 'childList':
          this.#rebuildChildren(record.target as Node, mirrored);

          break;
      }
    }
  }

  #syncAttribute(record: MutationRecord, mirrored: Element): void {
    const name = record.attributeName;

    if (!name) return;

    const ns = record.attributeNamespace ?? null;
    const source = record.target as Element;
    const value = ns
      ? source.getAttributeNS(ns, name)
      : source.getAttribute(name);

    if (value === null) {
      if (ns) mirrored.removeAttributeNS(ns, name);
      else mirrored.removeAttribute(name);
    } else if (ns) {
      mirrored.setAttributeNS(ns, name, value);
    } else {
      mirrored.setAttribute(name, value);
    }
  }

  #rebuildChildren(source: Node, mirrored: Node): void {
    while (mirrored.firstChild) mirrored.removeChild(mirrored.firstChild);

    for (const child of Array.from(source.childNodes)) {
      mirrored.appendChild(child.cloneNode(true));
    }
  }

  /**
   * Computes the chain of `childNodes` indices from `#target` down to `node`.
   * Returns `null` if `node` is not contained within `#target`.
   */
  #pathTo(node: Node): number[] | null {
    if (node === this.#target) return [];

    const path: number[] = [];
    let current: Node | null = node;

    while (current && current !== this.#target) {
      const parent: Node | null = current.parentNode;

      if (!parent) return null;
      path.push(Array.prototype.indexOf.call(parent.childNodes, current));
      current = parent;
    }

    return current === this.#target ? path.reverse() : null;
  }

  #descend(path: number[]): Node | null {
    let node: Node = this.clone;

    for (const index of path) {
      const next = node.childNodes[index];

      if (!next) return null;
      node = next;
    }

    return node;
  }
}
