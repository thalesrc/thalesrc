import { SignalWatcher } from "@lit-labs/signals";
import { LitElement } from "lit";

export interface EffectOptions {
    /**
     * By default effects run after the element has updated. If `beforeUpdate`
     * is set to `true`, the effect will run before the element updates.
     */
    beforeUpdate?: boolean;
    /**
     * By default, effects are automatically disposed when the element is
     * disconnected. If `manualDispose` is set to `true`, the effect will not
     * be automatically disposed, and you must call the returned function to
     * dispose of the effect manually.
     */
    manualDispose?: boolean;
}

/**
 * A LitElement base class extended with SignalWatcher capabilities.
 *
 * This class allows LitElement components to reactively watch for changes
 */
export const SignalWatcherLitElement = SignalWatcher(LitElement) as ({
  new (): LitElement & {
    updateEffect(fn: () => void, options?: EffectOptions): () => void;
  }
});
