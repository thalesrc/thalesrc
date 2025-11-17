/**
 * Join a union of strings with a separator.
 *
 * @example
 * ```ts
 * type Result = Join<"a" | "b" | "c", "-">;
 * // Result is "a" | "b" | "c" | "a-b" | "a-c" | "b-a" | "b-c" | "c-a" | "c-b" | "a-b-c" | "a-c-b" | "b-a-c" | "b-c-a" | "c-a-b" | "c-b-a"
 * type Result2 = Join<"x" | "y">;
 * // Result2 is "x" | "y" | "x,y" | "y,x"
 * ```
 */
export type Join<T extends string, Sep extends string = ',', U extends string = T> =
  U extends any ?
    | U
    | `${U}${Sep}${Join<Exclude<T, U>, Sep>}`
  : never;
