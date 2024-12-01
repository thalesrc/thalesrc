export function call<T>(func: (...args: any[]) => T): T {
  return func();
}
