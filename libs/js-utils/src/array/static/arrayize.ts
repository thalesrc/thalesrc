import { arrayize } from "@thalesrc/js-utils/array/arrayize";

declare global {
  export interface ArrayConstructor {
    arrayize: typeof arrayize;
  }
}

Array.arrayize = arrayize;
