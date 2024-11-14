import type { Tail } from '@thalesrc/extra-ts-types';

import { replace, ReplaceItemsOptions, ReplaceByMapOptions } from '@thalesrc/js-utils/array/replace';

declare global {
  export interface Array<T> {
    /**
     * #### Replace
     *
     * Replaces an item with passed one of an array
     *
     * * * *
     * Example:
     * ```typescript
     * import "@thalesrc/js-utils/array/proto/replace";
     *
     * const array = ["a", "b", "c", "a", "b", "c"];
     *
     * array.replace("b", "x"); // ["a", "x", "c", "a", "b", "c"]
     * ```
     * * * *
     * @param array Array to replace its item
     * @param itemToRemove Item to remove
     * @param itemToReplace Item to replace with
     * @return New replaced array
     */
    replace(itemToRemove: T, itemToReplace: T): T[];

    /**
     * #### Replace
     *
     * Deletes items and replaces new ones from passed starting index of an array
     *
     * * * *
     * Example:
     * ```typescript
     * import "@thalesrc/js-utils/array/proto/replace";
     *
     * const array = ["a", "b", "c", "a", "b", "c"];
     *
     * array.replace({startingIndex: 3, deleteCount: 1, itemsToReplace: ['x', 'y']}); // ["a", "b", "c", "x", "y", "b", "c"];
     * ```
     * * * *
     * @param array Array to replace its item
     * @param replaceOptions Replace options
     * @template T Typeof array items
     * @return New replaced array
     */
    replace(replaceOptions: ReplaceItemsOptions<T>): T[];

    /**
     * #### Replace
     *
     * Deletes items and replaces new ones by passed matcher map
     *
     * * * *
     * Example:
     * ```typescript
     * import "@thalesrc/js-utils/array/proto/replace";
     *
     * const array = ["a", "b", "c", "a", "b", "c"];
     * const map = new Map();
     * map.set("a", "x")
     * map.set("b", "y");
     *
     * array.replace({itemsToReplace: map}); // ["x", "y", "c", "a", "b", "c"];
     * array.replace({itemsToReplace: map, multi: true}); // ["x", "y", "c", "x", "y", "c"];
     * ```
     * * * *
     * @param array Array to replace its item
     * @param replaceOptions Replace options
     * @template T Typeof array items
     * @return New replaced array
     */
    replace(replaceOptions: ReplaceByMapOptions<T>): T[];
  }
}

Array.prototype.replace = <Array<any>['replace']>function<T>(this: T[], ...args: Tail<Parameters<typeof replace<T>>>): T[] {
  return replace(this, ...args);
};
