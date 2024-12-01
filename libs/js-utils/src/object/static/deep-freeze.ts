import { deepFreeze } from '@thalesrc/js-utils/object/deep-freeze';

declare global {
  export interface ObjectConstructor {
    deepFreeze: typeof deepFreeze;
  }
}

Object.deepFreeze = deepFreeze;
