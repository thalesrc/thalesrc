/* eslint-disable @typescript-eslint/no-explicit-any */

import { difference } from '@thalesrc/js-utils/array/difference';
import { intersection } from '@thalesrc/js-utils/array/intersection';
import { merge } from '@thalesrc/js-utils/map/merge';

/**
 * #### Cloning Options
 * Cloning options of the [clone]{@link clone} function
 */
export interface ICloneOptions {
  /**
   * #### Instance constructors which cloning unwanted
   * Give the instance constructors to prevent them being cloned
   *
   * * * *
   * Example:
   * ```typescript
   * import { clone } from "@thalesrc/js-utils/object";
   *
   * const object = {
   *   width: 250,
   *   element: document.querySelector("div")
   * };
   *
   * const clonedObject = clone(object, {instancesToRefer: [ HTMLElement ]});
   * // clonedObject.element === object.element
   * ```
   * * * *
   * @default []
   */
  instancesToRefer?: any[];

  /**
   * #### Value filterer to pass same references
   * Being called for each value while cloning. Return true to prevent cloning for the incoming value and pass the same reference instead.
   *
   * * * *
   * Example:
   * ```typescript
   * import { clone } from "@thalesrc/js-utils/object";
   *
   * const john = { age: 20, willBeReferenced: true };
   * const jane = { age: 25, willBeReferenced: false };
   *
   * const array = [john, jane];
   *
   * const clonedArray = clone(array, {valueFiltererToRefer: person => person.willBeReferenced });
   *
   * // clonedArray[0] === array[0]
   * // clonedArray[1] !== array[1]
   * ```
   * * * *
   * @param value incoming value to be cloned
   * @return Return true to pass same reference, false to clone
   * @default () => false
   */
  valueFiltererToRefer?(value: any): boolean;

  /**
   * #### Properties which cloning unwanted
   * Give the unwanted properties to prevent them being cloned
   *
   * * * *
   * Example:
   * ```typescript
   * import { clone } from "@thalesrc/js-utils/object";
   *
   * const object = {
   *   width: 250,
   *   element: document.querySelector("div")
   * };
   *
   * const clonedObject = clone(object, {propsToRefer: [ "element" ]});
   * // clonedObject.element === object.element
   * ```
   * * * *
   * @default []
   */
  propsToRefer?: Array<any>;

  /**
   * #### Custom Cloner Map
   *
   * * * *
   * Example:
   * ```typescript
   * import { clone } from "@thalesrc/js-utils/object";
   *
   * const object = {
   *  width: 250,
   *  element: document.querySelector("div")
   * };
   *
   * function divCloner(objectToClone, options, internalData) {
   *  const newElement = document.createElement("div");
   *  newElement.classList.add("cloned");
   *  return newElement;
   * }
   *
   * const customCloners = new Map();
   * customCloners.set(HTMLDivElement, divCloner);
   *
   * const clonedObject = clone(object);
   * ```
   * * * *
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  customCloners?: Map<Function, TInstanceCloner>;
}

/**
 * #### Internal Data For Cloning Process
 */
export interface IClonerInternalData {
  clonedObjects: Map<object, object | symbol>;
  parent?: Record<any, any>;
  key?: number | string | symbol;
  finalizers: Array<() => void>;
}

// TODO: uncomment the code below and delete polyfill when typedoc supports ts@2.8.x
// type TNonOptionalCloneOptions = Required<ICloneOptions>;
export type PolyfillRequired<T, TNames extends string> = { [P in TNames]: (T & { [name: string]: never })[P] };

/**
 * Cloning options with all properties required
 * @see ICloneOptions
 */
export type TNonOptionalCloneOptions = PolyfillRequired<ICloneOptions, keyof ICloneOptions>;

/**
 * Custom Cloner Function
 */
export type TInstanceCloner = <T>(objectToClone: T, options: TNonOptionalCloneOptions, internalData: IClonerInternalData) => T;

/**
 * A placeholder to symbolize the cloning progress of `objectToClone` hasn't finished yet
 */
const CLONING_IN_PROGRESS = Symbol('Cloning In Progress');

/**
 * Function Map to clone specific objects types
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const DEFAULT_INSTANCE_CLONERS = new Map<Function, TInstanceCloner>();

// Set cloning functions
DEFAULT_INSTANCE_CLONERS.set(Array, arrayCloner as any);
DEFAULT_INSTANCE_CLONERS.set(Map, mapCloner as any);
DEFAULT_INSTANCE_CLONERS.set(Set, setCloner as any);
DEFAULT_INSTANCE_CLONERS.set(Object, objectCloner as any);

/**
 * Default Array Cloner
 */
function arrayCloner(objectToClone: any[], options: TNonOptionalCloneOptions, internalData: IClonerInternalData) {
  return objectToClone.map((val, i, arr) => {
    if (options.propsToRefer!.indexOf(i) > -1) {
      return val;
    }

    return cloner(val, options, { ...internalData, parent: arr, key: i });
  }) as any;
}

/**
 * Default Map Cloner
 */
function mapCloner(objectToClone: Map<any, any>, options: TNonOptionalCloneOptions, internalData: IClonerInternalData) {
  const newMap = new Map();

  intersection(options.propsToRefer!, Array.from(objectToClone.keys())).forEach(key => {
    newMap.set(key, objectToClone.get(key));
  });

  difference(Array.from(objectToClone.keys()), options.propsToRefer!).forEach(key => {
    newMap.set(key, cloner(objectToClone.get(key), options, { ...internalData, key, parent: newMap }));
  });

  return newMap;
}

/**
 * Default Set Cloner
 */
function setCloner(objectToClone: Set<any>) {
  return new Set(objectToClone);
}

/**
 * Default Object Cloner
 */
function objectCloner(objectToClone: Record<any, any>, options: TNonOptionalCloneOptions, internalData: IClonerInternalData) {
  const { propsToRefer } = options;

  /**
   * New Object Clone
   */
  const _clone: Record<any, any> = {};

  /**
   * Object cloner
   * @param key incoming property of object to clone
   */
  function cloneObject(key: any) {
    _clone[key] = cloner(objectToClone[key], options, { ...internalData, parent: _clone, key });
  }

  const allProperties = [...Object.keys(objectToClone), ...Object.getOwnPropertySymbols(objectToClone)];

  // Pass unwanted props
  intersection(<any[]>propsToRefer, allProperties).forEach(prop => {
    _clone[prop] = objectToClone[prop];
  });

  // Clone remaining properties
  difference(allProperties, propsToRefer!).forEach(cloneObject);

  return _clone;
}

/**
 * #### Deep Clone
 *
 * A function to recursively clone objects, arrays etc. with [cloning options]{@link ICloneOptions}
 *
 * *References Functions & Symbols by default*
 *
 * * * *
 * Example:
 * ```typescript
 * import { clone } from "@thalesrc/js-utils/object";
 *
 * const object = {a: 1, b: {c: true, d: ["x", "y"]}};
 *
 * // Clone all
 * const clonedObject = clone(object);
 * // {a: 1, b: {c: true, d: ["x", "y"]}}
 * // object.b.d === clonedObject.b.d // false
 *
 * // Clone all but reference "d"
 * const clonedObject = clone(object, {propsToRefer: ["d"]});
 * // {a: 1, b: {c: true, d: ["x", "y"]}}
 * // object.b.d === clonedObject.b.d // true
 * ```
 *
 * Static usage example:
 * ```typescript
 * import "@thalesrc/js-utils/object/static/clone";
 *
 * const object = {a: 1, b: 2};
 * const clonedObject = Object.clone(object); // {a: 1, b: 2}
 * ```
 * * * *
 * @param objectToClone Object to clone
 * @param options {ICloneOptions} Cloning Options
 * @see {@link ICloneOptions} for more information.
 */
export function clone<T>(
  objectToClone: T,
  {
    instancesToRefer = [],
    propsToRefer = [],
    valueFiltererToRefer = () => false,
    customCloners = new Map()
  }: ICloneOptions = <ICloneOptions>{}
): T {
  /**
   * Whole options with defaults
   */
  const mergedCloners = merge(customCloners, DEFAULT_INSTANCE_CLONERS);
  const allOptions: TNonOptionalCloneOptions = { instancesToRefer, propsToRefer, valueFiltererToRefer, customCloners: mergedCloners };

  const finalizers: (() => void)[] = [];
  const cloned = cloner(objectToClone, allOptions, { clonedObjects: new Map(), finalizers });

  finalizers.forEach(callback => { callback(); });

  return cloned;
}

function cloner<T>(
  objectToClone: T,
  allOptions: TNonOptionalCloneOptions,
  internalData: IClonerInternalData
): T {
  const { instancesToRefer, valueFiltererToRefer, customCloners } = allOptions;
  const { clonedObjects, finalizers, parent, key } = internalData;

  // Pass primitives & functions
  if (objectToClone === null || !(objectToClone instanceof Object) || objectToClone instanceof Function) {
    return objectToClone;
  }

  // Pass unwanted references
  if (instancesToRefer!.some(instance => objectToClone instanceof instance)) {
    return objectToClone;
  }

  // Pass filterer results
  if (valueFiltererToRefer!(objectToClone)) {
    return objectToClone;
  }

  // If cloned before, skip circular cloning
  if (clonedObjects.has(objectToClone)) {
    if (clonedObjects.get(objectToClone) === CLONING_IN_PROGRESS) {
      finalizers.push(() => {
        parent![key as any] = clonedObjects.get(objectToClone);
      });

      return null!;
    }
    return clonedObjects.get(objectToClone) as T;
  }

  // Mark object as cloning
  clonedObjects.set(objectToClone, CLONING_IN_PROGRESS);

  // Clone
  const customCloner = Array.from(customCloners!.keys()).find(val => objectToClone instanceof val);
  const result = customCloners!.get(customCloner!)!(objectToClone, allOptions, { ...internalData });
  clonedObjects.set(objectToClone, result);
  return result;
}
