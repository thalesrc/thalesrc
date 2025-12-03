import { Subject } from 'rxjs';

import { MessageHost } from '../message-host';
import { SuccessfulMessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { DEFAULT_CONNECTION_NAME } from './default-connection-name';

const PORTS = Symbol('Ports');
const REQUESTS$ = Symbol('Requests');

export class ChromeMessageHost extends MessageHost {
  private static readonly PORT_IDENTIFIER = 'portIdentifier';

  private [PORTS]: {[key: string]: chrome.runtime.Port} = {};
  private [REQUESTS$] = new Subject<Message>();

  constructor(name = DEFAULT_CONNECTION_NAME) {
    super();

    chrome.runtime.onConnect.addListener((port) => {
      if (port.name !== name) {
        return;
      }

      port.onMessage.addListener((message: Message, incomingMessagePort: chrome.runtime.Port) => {
        if (!this[PORTS][incomingMessagePort.sender.tab.id]) {
          this[PORTS][incomingMessagePort.sender.tab.id] = incomingMessagePort;

          incomingMessagePort.onDisconnect.addListener(disconnectedPort => {
            delete this[PORTS][disconnectedPort.sender.tab.id];
            this.terminateMessage$.next(message.id);
          });
        }

        const newMessage = {
          ...message,
          id: `${message.id}&${ChromeMessageHost.PORT_IDENTIFIER}=${incomingMessagePort.sender.tab.id}`,
        };

        this[REQUESTS$].next(newMessage);
      });
    });

    this.listen(this[REQUESTS$]);
  }

  protected response(message: SuccessfulMessageResponse): void {
    const [messageId, portId] = message.id.split(`&${ChromeMessageHost.PORT_IDENTIFIER}=`);

    message.id = messageId;

    if (this[PORTS][portId]) {
      this[PORTS][portId].postMessage(message);
    }
  }
}
