import { chain } from "../chain";

declare global {
  export interface PromiseConstructor {
    /**
     * #### Chain
     * Chains promises in a sequential order
     */
    chain: typeof chain;
  }
}

Promise.chain = chain;