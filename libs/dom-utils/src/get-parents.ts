export function* getParents<T extends HTMLElement = HTMLElement>(node: T): Generator<T> {
  while (node.parentElement) {
    yield node = node.parentElement as T;
  }
}
