export function* getParents(node: Node): Generator<Node> {
  while (node.parentElement) {
    yield node = node.parentElement;
  }
}
