import { noop } from '@thalesrc/js-utils';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ListenerStorage } from './listener-storage.type';
import { SuccessfulMessageResponse } from './message-response.type';
import { Message } from './message.interface';
import { MESSAGE_LISTENERS } from './selectors';


/**
 * Message Host
 */
export abstract class MessageHost {
  /**
   * Message Terminator Subject
   *
   * Use `next(messageId)` method to terminate a message connection
   */
  protected readonly terminateMessage$ = new Subject<string>();

  /**
   * Run this method to start listening the requests
   */
  protected readonly listen = (messages$: Observable<Message>): void => {
    for (const [path, listeners] of this.#getListeners()) {
      messages$
        .pipe(filter(({path: messagePath}) => path === messagePath))
        .subscribe(({body, id}) => {
          for (const listener of listeners) {
            (listener.call(this, body) as Observable<any>).pipe(
              takeUntil(this.terminateMessage$.pipe(filter(terminatedMessageId => terminatedMessageId === id))),
            ).subscribe(result => {
              this.response({completed: false, id, body: result});
            }, noop, () => {
              this.response({completed: true, id });
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
  protected abstract response<T = any>(message: SuccessfulMessageResponse<T>): void;

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
