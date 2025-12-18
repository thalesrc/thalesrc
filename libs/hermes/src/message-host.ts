import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ListenerStorage } from './listener-storage.type';
import { SuccessfulMessageResponse } from './message-response.type';
import { Message } from './message.interface';
import { LISTEN, MESSAGE_LISTENERS, RESPONSE, TERMINATE_MESSAGE$ } from './selectors';

/**
 * Message Host
 */
export abstract class MessageHost {
  /**
   * Message Terminator Subject
   *
   * Use `next(messageId)` method to terminate a message connection
   */
  protected readonly [TERMINATE_MESSAGE$] = new Subject<string>();

  /**
   * Run this method to start listening the requests
   */
  protected readonly [LISTEN] = (messages$: Observable<Message>): void => {
    for (const [path, listeners] of this.#getListeners()) {
      messages$
        .pipe(filter(({path: messagePath}) => path === messagePath))
        .subscribe(({body, id}) => {
          for (const listener of listeners) {
            (listener.call(this, body) as Observable<any>).pipe(
              takeUntil(this[TERMINATE_MESSAGE$].pipe(filter(terminatedMessageId => terminatedMessageId === id))),
            ).subscribe({
              next: result => {
                this[RESPONSE]({completed: false, id, body: result});
              },
              error: error => {
                this[RESPONSE]({completed: true, id, error});
              },
              complete: () => {
                this[RESPONSE]({completed: true, id });
              }
            });
          }
        });
    }
  }

  /**
   * Build a reponse method to send the responses to the requests by using the communication methods of the platform
   *
   * @param message Incoming response message
   */
  protected abstract [RESPONSE]<T = any>(message: SuccessfulMessageResponse<T>): void;

  /**
   * All inherited listeners
   */
  #getListeners(): ListenerStorage {
    const map: ListenerStorage = new Map();

    let currentProto = (this as any)['__proto__' + ''];

    while (currentProto.constructor !== Object) {
      if (Reflect.ownKeys(currentProto.constructor).includes(MESSAGE_LISTENERS)) {
        for (const [key, handlers] of currentProto.constructor[MESSAGE_LISTENERS] as ListenerStorage) {
          map.set(key, [...(map.get(key) || []), ...handlers]);
        }
      }

      currentProto = currentProto.__proto__;
    }

    return map;
  }
}
