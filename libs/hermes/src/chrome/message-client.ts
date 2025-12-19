import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import { MessageClient } from '../message-client';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { DEFAULT_CONNECTION_NAME } from './default-connection-name';

const RANDOM_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const RANDOM_ID_CHARS_LENGTH = RANDOM_ID_CHARS.length;
const PORT = Symbol('Port');

interface Connection {
  port: chrome.runtime.Port;
  responses: Observable<MessageResponse>;
}

export class ChromeMessageClient extends MessageClient {
  private static readonly connections: { [key: string]: Connection } = {};

  public [RESPONSES$]: Observable<MessageResponse>;
  private [PORT]: chrome.runtime.Port;

  constructor(name = DEFAULT_CONNECTION_NAME) {
    super();

    if (!(name in ChromeMessageClient.connections)) {
      const port = chrome.runtime.connect({ name });
      const responses = new Observable<MessageResponse>(subscriber => {
        port.onMessage.addListener((message: MessageResponse) => {
          subscriber.next(message);
        });
      }).pipe(share());

      ChromeMessageClient.connections[name] = { port, responses };
    }

    this[PORT] = ChromeMessageClient.connections[name].port;
    this[RESPONSES$] = ChromeMessageClient.connections[name].responses;
  }

  public [SEND]<T>(message: Message<T>) {
    this[PORT].postMessage(message);
  }

  protected [GET_NEW_ID](): string {
    let result = '' + Date.now();

    for (let i = 0; i < 10; i++) {
      result += RANDOM_ID_CHARS.charAt(Math.floor(Math.random() * RANDOM_ID_CHARS_LENGTH));
    }

    return result;
  }
}
