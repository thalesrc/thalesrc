/* eslint-disable @typescript-eslint/no-explicit-any */

export type Tail<X extends readonly any[]> = ((...args: X) => any) extends (arg: any, ...rest: infer U) => any ? U : never;
