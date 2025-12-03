import { ListenerStorage } from './listener-storage.type';
import { MESSAGE_LISTENERS } from './selectors';

/**
 * Decorate a generator method to listen messages of a domain and reply them by using `yield`
 *
 * @param path Acts like an api endpoint path of an XHR for extensions messaging
 */
export function Listen(path?: string): MethodDecorator {
  return function(target, key: string, descriptor: TypedPropertyDescriptor<any>) {
    if (!target.constructor[MESSAGE_LISTENERS]) {
      target.constructor[MESSAGE_LISTENERS] = new Map();
    }

    (target.constructor[MESSAGE_LISTENERS] as ListenerStorage).set(path || key, [
      ...(target.constructor[MESSAGE_LISTENERS].get(path || key) || []),
      descriptor.value
    ] as any);
  };
}
