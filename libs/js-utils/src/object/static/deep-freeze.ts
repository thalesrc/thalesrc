import { deepFreeze } from '@telperion/js-utils/object/deep-freeze';

declare global {
  export interface ObjectConstructor {
    deepFreeze: typeof deepFreeze;
  }
}

Object.deepFreeze = deepFreeze;
