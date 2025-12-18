export interface Message<T = any> {
  path: string;
  body: T;
  id: string;
  error?: any;
}
