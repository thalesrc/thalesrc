// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClone } from './dom-clone';

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe('DomClone', () => {
  let target: HTMLDivElement;

  beforeEach(() => {
    target = document.createElement('div');
    target.id = 'src';
    target.innerHTML = '<span class="a">hello</span><em>!</em>';
    document.body.appendChild(target);
  });

  afterEach(() => {
    target.remove();
  });

  it('produces an initial deep clone equal to the target', () => {
    const mirror = new DomClone(target);
    expect(mirror.clone).not.toBe(target);
    expect(mirror.clone.outerHTML).toBe(target.outerHTML);
    mirror.disconnect();
  });

  it('mirrors attribute additions, changes, and removals', async () => {
    const mirror = new DomClone(target);

    target.setAttribute('data-x', '1');
    await flush();
    expect(mirror.clone.getAttribute('data-x')).toBe('1');

    target.setAttribute('data-x', '2');
    await flush();
    expect(mirror.clone.getAttribute('data-x')).toBe('2');

    target.removeAttribute('data-x');
    await flush();
    expect(mirror.clone.hasAttribute('data-x')).toBe(false);

    mirror.disconnect();
  });

  it('mirrors inline style mutations via the style attribute', async () => {
    const mirror = new DomClone(target);

    target.style.color = 'red';
    await flush();
    expect((mirror.clone as HTMLElement).style.color).toBe('red');

    mirror.disconnect();
  });

  it('mirrors child insertions and removals', async () => {
    const mirror = new DomClone(target);

    const added = document.createElement('b');
    added.textContent = 'new';
    target.appendChild(added);
    await flush();
    expect(mirror.clone.querySelector('b')?.textContent).toBe('new');

    target.removeChild(added);
    await flush();
    expect(mirror.clone.querySelector('b')).toBeNull();

    mirror.disconnect();
  });

  it('mirrors text/character-data changes in the subtree', async () => {
    const mirror = new DomClone(target);
    const span = target.querySelector('span')!;

    span.firstChild!.nodeValue = 'world';
    await flush();
    expect(mirror.clone.querySelector('span')?.textContent).toBe('world');

    mirror.disconnect();
  });

  it('mirrors mutations on nested descendants', async () => {
    const mirror = new DomClone(target);
    const span = target.querySelector('span')!;

    span.setAttribute('title', 'tip');
    await flush();
    expect(mirror.clone.querySelector('span')?.getAttribute('title')).toBe('tip');

    mirror.disconnect();
  });

  it('stops mirroring after disconnect()', async () => {
    const mirror = new DomClone(target);
    mirror.disconnect();

    target.setAttribute('data-x', '1');
    await flush();
    expect(mirror.clone.hasAttribute('data-x')).toBe(false);
  });

  it('disconnect() is idempotent', () => {
    const mirror = new DomClone(target);
    const spy = vi.spyOn(MutationObserver.prototype, 'disconnect');
    mirror.disconnect();
    mirror.disconnect();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
