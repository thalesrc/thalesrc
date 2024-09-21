import type { ConstructorType } from '@thalesrc/extra-ts-types';
import { noop } from '@thalesrc/js-utils/function/noop';

type Executor<T> = ConstructorParameters<ConstructorType<typeof Promise<T>>>[0];
type ExecutorParams<T> = Parameters<Executor<T>>;
type Resolver<T> = ExecutorParams<T>[0];
type Rejector = ExecutorParams<unknown>[1];

/**
 * #### Open Promise
 * A promise constructor to resolve or reject from outside
 *
 * * * *
 * Example:
 * ```typescript
 * import { OpenPromise } from "@thalesrc/js-utils";
 *
 * const aPromiseWillBeResolvedLater = new OpenPromise();
 *
 * aPromiseWillBeResolvedLater.then(val => console.log(val));
 * // aPromiseWillBeResolvedLater.finished // false
 * ...
 * ...
 *
 * aPromiseWillBeResolvedLater.resolve({x: 1});
 * // aPromiseWillBeResolvedLater.finished // true
 * ```
 * * * *
 * @template T typeof the value which is going to be resolved
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class OpenPromise<T = any> extends Promise<T> {
  #resolved = false;
  #rejected = false;

  #resolver: Resolver<T> = noop;
  #rejector: Rejector = noop;


  /**
   * Returns whether is the promise resolved
   */
  get resolved() {
    return this.#resolved;
  }

  /**
   * Returns whether is the promise rejected
   */
  get rejected() {
    return this.#rejected;
  }

  /**
   * Returns whether is the promise finished
   */
  get finished() {
    return this.#resolved || this.#rejected;
  }

  /**
   * Open Promise Constructor
   */
  constructor(executor: Executor<T> = noop) {
    super((resolve, reject) => {
      this.#resolver = resolve;
      this.#rejector = reject;

      executor(resolve, reject);
    });
  }

  /**
   * Resolves promise
   * @param value Value to resolve the promise
   */
  resolve(...args: Parameters<Resolver<T>>): void {
    if (this.finished) throw new Error('Promise is already finished');

    this.#resolved = true;
    this.#resolver(...args);
  }

  /**
   * Rejects promise
   * @param reason Error to reject promise
   */
  reject(...args: Parameters<Rejector>): void {
    if (this.finished) throw new Error('Promise is already finished');

    this.#rejected = true;
    this.#rejector(...args);
  }

  /**
   * Binds a promise to the inner promise to resolve or reject with it
   * @param promise A promise to bind inner promise
   */
  bindTo(promise: Promise<T>): void {
    promise
      .then(e => { this.resolve(e); })
      .catch(e => this.reject(e));
  }
}
