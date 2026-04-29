/**
 * Tiny zero-dependency concurrency limiter. Equivalent to `p-limit` but kept
 * inline to avoid pulling another package into the executor's runtime.
 */
export interface Limiter {
  <T>(fn: () => Promise<T>): Promise<T>;
  readonly active: number;
  readonly pending: number;
}

export function createLimit(concurrency: number): Limiter {
  if (!Number.isFinite(concurrency) || concurrency < 1) {
    throw new Error(`createLimit: concurrency must be >= 1 (got ${concurrency})`);
  }
  let active = 0;
  const queue: Array<() => void> = [];

  const next = (): void => {
    if (active >= concurrency) return;
    const job = queue.shift();
    if (job) job();
  };

  const limit = <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((res, rej) => {
      const run = (): void => {
        active++;
        Promise.resolve()
          .then(fn)
          .then(res, rej)
          .finally(() => {
            active--;
            next();
          });
      };
      if (active < concurrency) run();
      else queue.push(run);
    });

  return Object.defineProperties(limit as Limiter, {
    active: { get: () => active },
    pending: { get: () => queue.length },
  });
}
